# Copyright 2021 QuantumBlack Visual Analytics Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
# NONINFRINGEMENT. IN NO EVENT WILL THE LICENSOR OR OTHER CONTRIBUTORS
# BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# The QuantumBlack Visual Analytics Limited ("QuantumBlack") name and logo
# (either separately or in combination, "QuantumBlack Trademarks") are
# trademarks of QuantumBlack. The License does not grant you any right or
# license to the QuantumBlack Trademarks. You may not use the QuantumBlack
# Trademarks or any confusingly similar mark as a trademark for your product,
# or use the QuantumBlack Trademarks in any other manner that might cause
# confusion in the marketplace, including but not limited to in advertising,
# on websites, or on software.
#
# See the License for the specific language governing permissions and
# limitations under the License.
from typing import Dict

import networkx as nx
import pytest
from kedro.extras.datasets.pandas import CSVDataSet
from kedro.io import DataCatalog
from kedro.pipeline import Pipeline, node
from kedro.pipeline.modular_pipeline import pipeline

from kedro_viz.constants import DEFAULT_REGISTERED_PIPELINE_ID, ROOT_MODULAR_PIPELINE_ID
from kedro_viz.data_access.managers import DataAccessManager
from kedro_viz.models.graph import (
    DataNode,
    GraphEdge,
    ParametersNode,
    Tag,
    TaskNode,
    TranscodedDataNode,
)


def identity(x):
    return x


class TestAddCatalog:
    def test_add_catalog(self, data_access_manager: DataAccessManager):
        dataset = CSVDataSet(filepath="dataset.csv")
        catalog = DataCatalog(data_sets={"dataset": dataset})
        data_access_manager.add_catalog(catalog)
        assert data_access_manager.catalog.get_catalog() is catalog


class TestAddNode:
    def test_add_node(self, data_access_manager: DataAccessManager):
        kedro_node = node(
            identity,
            inputs="x",
            outputs="y",
            name="identity_node",
            tags=["tag1", "tag2"],
        )
        graph_node = data_access_manager.add_node("my_pipeline", kedro_node)
        nodes_list = data_access_manager.nodes.as_list()
        assert len(nodes_list) == 1
        assert isinstance(graph_node, TaskNode)
        assert graph_node.belongs_to_pipeline("my_pipeline")
        assert graph_node.has_metadata
        assert graph_node.kedro_obj is kedro_node
        assert data_access_manager.tags.as_list() == [Tag("tag1"), Tag("tag2")]

    def test_add_node_with_modular_pipeline(
        self, data_access_manager: DataAccessManager
    ):
        kedro_node = node(
            identity,
            inputs="x",
            outputs="y",
            namespace="uk.data_science.modular_pipeline",
        )
        graph_node = data_access_manager.add_node("my_pipeline", kedro_node)
        assert graph_node.modular_pipelines == [
            "uk",
            "uk.data_science",
            "uk.data_science.modular_pipeline",
        ]

    def test_add_node_input(self, data_access_manager: DataAccessManager):
        dataset = CSVDataSet(filepath="dataset.csv")
        dataset_name = "x"
        registered_pipeline_id = "my_pipeline"

        # add a Kedro node to the graph
        kedro_node = node(
            identity, inputs=dataset_name, outputs="output", tags=["tag1", "tag2"]
        )
        task_node = data_access_manager.add_node(registered_pipeline_id, kedro_node)

        # add its input to the graph
        catalog = DataCatalog(
            data_sets={dataset_name: dataset},
        )
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset(registered_pipeline_id, dataset_name)
        data_node = data_access_manager.add_node_input(
            registered_pipeline_id, dataset_name, task_node
        )
        assert isinstance(data_node, DataNode)

        # the graph should have 2 nodes: the task node and its input data node
        nodes_list = data_access_manager.nodes.as_list()
        assert nodes_list == [task_node, data_node]
        # it should have an edge between these two nodes
        assert data_access_manager.get_edges_for_registered_pipeline(
            registered_pipeline_id
        ) == [GraphEdge(source=data_node.id, target=task_node.id)]
        # the input data node should have the task node's tags
        assert data_node.tags == {"tag1", "tag2"}
        assert data_access_manager.get_node_dependencies_for_registered_pipeline(
            registered_pipeline_id
        ) == {
            data_node.id: {
                task_node.id,
            }
        }

    def test_add_parameters_as_node_input(self, data_access_manager: DataAccessManager):
        parameters = {"train_test_split": 0.1, "num_epochs": 1000}
        catalog = DataCatalog()
        catalog.add_feed_dict({"parameters": parameters})
        data_access_manager.add_catalog(catalog)
        registered_pipeline_id = "my_pipeline"
        kedro_node = node(identity, inputs="parameters", outputs="output")
        task_node = data_access_manager.add_node(registered_pipeline_id, kedro_node)
        parameters_node = data_access_manager.add_node_input(
            registered_pipeline_id, "parameters", task_node
        )
        assert isinstance(parameters_node, ParametersNode)
        assert task_node.parameters == parameters

    def test_add_single_parameter_as_node_input(
        self, data_access_manager: DataAccessManager
    ):
        catalog = DataCatalog()
        catalog.add_feed_dict({"params:train_test_split": 0.1})
        data_access_manager.add_catalog(catalog)
        registered_pipeline_id = "my_pipeline"
        kedro_node = node(identity, inputs="params:train_test_split", outputs="output")
        task_node = data_access_manager.add_node(registered_pipeline_id, kedro_node)
        parameter_node = data_access_manager.add_node_input(
            registered_pipeline_id, "params:train_test_split", task_node
        )
        assert isinstance(parameter_node, ParametersNode)
        assert task_node.parameters == {"train_test_split": 0.1}

    def test_parameters_yaml_namespace_not_added_to_modular_pipelines(
        self, data_access_manager: DataAccessManager
    ):
        parameter_name = "params:uk.data_science.train_test_split.ratio"
        catalog = DataCatalog()
        catalog.add_feed_dict({parameter_name: 0.1})
        data_access_manager.add_catalog(catalog)
        registered_pipeline_id = "my_pipeline"
        kedro_node = node(
            identity,
            inputs=parameter_name,
            outputs="output",
            namespace="uk.data_science",
        )
        task_node = data_access_manager.add_node(registered_pipeline_id, kedro_node)
        data_access_manager.add_node_input(
            registered_pipeline_id, parameter_name, task_node
        )
        modular_pipelines_tree = (
            data_access_manager.create_modular_pipelines_tree_for_registered_pipeline(
                registered_pipeline_id
            )
        )
        # make sure parameters YAML namespace not accidentally added to the modular pipeline tree
        assert "uk.data_science.train_test_split" not in modular_pipelines_tree

    def test_add_node_output(self, data_access_manager: DataAccessManager):
        dataset = CSVDataSet(filepath="dataset.csv")
        registered_pipeline_id = "my_pipeline"
        dataset_name = "x"

        # add a Kedro node to the graph
        kedro_node = node(
            identity, inputs="input", outputs=dataset_name, tags=["tag1", "tag2"]
        )
        task_node = data_access_manager.add_node(registered_pipeline_id, kedro_node)

        # add its output to the graph
        catalog = DataCatalog(
            data_sets={dataset_name: dataset},
        )
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset(registered_pipeline_id, dataset_name)
        data_node = data_access_manager.add_node_output(
            registered_pipeline_id, dataset_name, task_node
        )

        # the graph should have 2 nodes: the task node and its output data node
        nodes_list = data_access_manager.nodes.as_list()
        assert nodes_list == [task_node, data_node]
        # it should have an edge between these two nodes
        assert data_access_manager.get_edges_for_registered_pipeline(
            registered_pipeline_id
        ) == [GraphEdge(source=task_node.id, target=data_node.id)]
        # the output data node should have the task node's tags
        assert data_node.tags == {"tag1", "tag2"}
        assert data_access_manager.get_node_dependencies_for_registered_pipeline(
            registered_pipeline_id
        ) == {
            task_node.id: {
                data_node.id,
            }
        }


class TestAddDataSet:
    def test_add_dataset(self, data_access_manager: DataAccessManager):
        dataset = CSVDataSet(filepath="dataset.csv")
        dataset_name = "x"
        catalog = DataCatalog(
            data_sets={dataset_name: dataset},
            layers={"raw": {dataset_name}},
        )
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset("my_pipeline", dataset_name)

        # dataset should be added as a gragph node
        nodes_list = data_access_manager.nodes.as_list()
        assert len(nodes_list) == 1
        graph_node = nodes_list[0]
        assert isinstance(graph_node, DataNode)
        assert graph_node.kedro_obj is dataset
        assert graph_node.layer == "raw"
        assert graph_node.belongs_to_pipeline("my_pipeline")
        assert not graph_node.modular_pipelines

    def test_add_dataset_with_modular_pipeline(
        self, data_access_manager: DataAccessManager
    ):
        dataset = CSVDataSet(filepath="dataset.csv")
        dataset_name = "uk.data_science.x"
        catalog = DataCatalog(
            data_sets={dataset_name: dataset},
        )
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset("my_pipeline", dataset_name)
        nodes_list = data_access_manager.nodes.as_list()
        graph_node: DataNode = nodes_list[0]
        assert graph_node.modular_pipelines == [
            "uk",
            "uk.data_science",
        ]

    def test_add_all_parameters(self, data_access_manager: DataAccessManager):
        catalog = DataCatalog()
        catalog.add_feed_dict(
            {"parameters": {"train_test_split": 0.1, "num_epochs": 1000}}
        )
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset("my_pipeline", "parameters")

        nodes_list = data_access_manager.nodes.as_list()
        assert len(nodes_list) == 1
        graph_node = nodes_list[0]
        assert isinstance(graph_node, ParametersNode)
        assert graph_node.is_all_parameters()
        assert graph_node.parameter_value == {
            "train_test_split": 0.1,
            "num_epochs": 1000,
        }

    def test_add_single_parameter(self, data_access_manager: DataAccessManager):
        catalog = DataCatalog()
        catalog.add_feed_dict({"params:train_test_split": 0.1})
        data_access_manager.add_catalog(catalog)
        data_access_manager.add_dataset("my_pipeline", "params:train_test_split")
        nodes_list = data_access_manager.nodes.as_list()
        assert len(nodes_list) == 1
        graph_node = nodes_list[0]
        assert isinstance(graph_node, ParametersNode)
        assert graph_node.is_single_parameter()
        assert graph_node.parameter_value == 0.1


class TestAddPipelines:
    def test_add_pipelines(
        self,
        data_access_manager: DataAccessManager,
        example_pipelines: Dict[str, Pipeline],
        example_catalog: DataCatalog,
    ):
        data_access_manager.add_catalog(example_catalog)
        data_access_manager.add_pipelines(example_pipelines)

        assert [p.id for p in data_access_manager.registered_pipelines.as_list()] == [
            DEFAULT_REGISTERED_PIPELINE_ID,
            "data_science",
            "data_processing",
        ]
        assert {n.full_name for n in data_access_manager.nodes.as_list()} == {
            "process_data",
            "train_model",
            "uk.data_science.model",
            "uk.data_processing.raw_data",
            "model_inputs",
            "parameters",
            "params:train_test_split",
        }
        assert data_access_manager.tags.as_list() == [Tag("split"), Tag("train")]
        assert sorted(data_access_manager.modular_pipelines.as_dict().keys()) == sorted(
            [
                ROOT_MODULAR_PIPELINE_ID,
                "uk.data_processing",
                "uk.data_science",
            ]
        )
        assert sorted(
            data_access_manager.create_modular_pipelines_tree_for_registered_pipeline().keys()
        ) == sorted(
            [
                ROOT_MODULAR_PIPELINE_ID,
                "uk",
                "uk.data_processing",
                "uk.data_science",
            ]
        )

    def test_add_pipelines_with_transcoded_data(
        self,
        data_access_manager: DataAccessManager,
        example_transcoded_pipelines: Dict[str, Pipeline],
        example_transcoded_catalog: DataCatalog,
    ):
        data_access_manager.add_catalog(example_transcoded_catalog)
        data_access_manager.add_pipelines(example_transcoded_pipelines)
        assert any(
            isinstance(node, TranscodedDataNode)
            for node in data_access_manager.nodes.as_list()
        )

    def test_get_default_selected_pipelines_without_default(
        self,
        data_access_manager: DataAccessManager,
        example_pipelines: Dict[str, Pipeline],
        example_catalog: DataCatalog,
    ):
        data_access_manager.add_catalog(example_catalog)
        del example_pipelines[DEFAULT_REGISTERED_PIPELINE_ID]
        data_access_manager.add_pipelines(example_pipelines)
        assert not data_access_manager.registered_pipelines.get_pipeline_by_id(
            DEFAULT_REGISTERED_PIPELINE_ID
        )
        assert data_access_manager.get_default_selected_pipeline().id == "data_science"

    def test_add_pipelines_with_circular_modular_pipelines(
        self,
        data_access_manager: DataAccessManager,
    ):
        # in this test example,
        # internal modular pipeline has two disconnected nodes: a->b and c->d
        # b connects as input to an external modular pipeline
        # while c serves as that modular pipeline's output
        # which creates a circular dependency between internal and external.

        internal = pipeline(
            Pipeline(
                [
                    node(
                        identity,
                        inputs="a",
                        outputs="b",
                    ),
                    node(
                        identity,
                        inputs="c",
                        outputs="d",
                    ),
                ]
            ),
            namespace="internal",
            inputs={"c"},
            outputs={"b"},
        )
        external = pipeline(
            Pipeline(
                [
                    node(
                        identity,
                        inputs="b",
                        outputs="c",
                    )
                ]
            ),
            namespace="external",
            inputs={"b"},
            outputs={"c"},
        )

        registered_pipelines = {
            "__default__": internal + external,
        }
        data_access_manager.add_catalog(DataCatalog())
        data_access_manager.add_pipelines(registered_pipelines)
        data_access_manager.create_modular_pipelines_tree_for_registered_pipeline(
            DEFAULT_REGISTERED_PIPELINE_ID
        )
        edges = data_access_manager.get_edges_for_registered_pipeline(
            DEFAULT_REGISTERED_PIPELINE_ID
        )

        # make sure that the original edge external.d->internal.d that forms the cycle
        # is not in the final list of edges
        d = next(edge for edge in edges if edge.source == "external").target
        assert not any(edge.target == "internal" for edge in edges if edge.source == d)

        digraph = nx.DiGraph()
        for edge in edges:
            digraph.add_edge(edge.source, edge.target)
        with pytest.raises(nx.NetworkXNoCycle):
            nx.find_cycle(digraph)
