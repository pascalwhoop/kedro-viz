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

from kedro_viz.constants import ROOT_MODULAR_PIPELINE_ID, DEFAULT_REGISTERED_PIPELINE_ID
from kedro_viz.models.graph import GraphNode, GraphNodeType, ModularPipelineChild
from kedro_viz.services import modular_pipelines_services


def test_expand_tree_no_nested_key():
    modular_pipeline_id = "data_science"
    modular_pipeline_node = GraphNode.create_modular_pipeline_node(modular_pipeline_id)
    modular_pipeline_node.add_pipeline(DEFAULT_REGISTERED_PIPELINE_ID)
    tree = {modular_pipeline_id: modular_pipeline_node}
    expanded_tree = modular_pipelines_services.expand_tree(tree)
    assert sorted(expanded_tree.keys()) == [ROOT_MODULAR_PIPELINE_ID, "data_science"]
    assert expanded_tree[modular_pipeline_id].name == "Data Science"
    assert expanded_tree[modular_pipeline_id].full_name == "data_science"


def test_expanded_tree_with_nested_key():
    modular_pipeline_id = "uk.data_science.model_training"
    modular_pipeline_node = GraphNode.create_modular_pipeline_node(modular_pipeline_id)
    modular_pipeline_node.add_pipeline(DEFAULT_REGISTERED_PIPELINE_ID)
    tree = {modular_pipeline_id: modular_pipeline_node}
    expanded_tree = modular_pipelines_services.expand_tree(tree)
    assert sorted(expanded_tree.keys()) == [
        ROOT_MODULAR_PIPELINE_ID,
        "uk",
        "uk.data_science",
        "uk.data_science.model_training",
    ]
    assert expanded_tree[ROOT_MODULAR_PIPELINE_ID].children == {
        ModularPipelineChild(id="uk", type=GraphNodeType.MODULAR_PIPELINE)
    }
    assert expanded_tree["uk"].children == {
        ModularPipelineChild(id="uk.data_science", type=GraphNodeType.MODULAR_PIPELINE)
    }
    assert expanded_tree["uk.data_science"].children == {
        ModularPipelineChild(
            id="uk.data_science.model_training", type=GraphNodeType.MODULAR_PIPELINE
        )
    }


def test_expanded_tree_should_add_child_inputs_outputs_to_parent():
    modular_pipeline_id = "uk.data_science"
    modular_pipeline_node = GraphNode.create_modular_pipeline_node(modular_pipeline_id)
    modular_pipeline_node.add_pipeline(DEFAULT_REGISTERED_PIPELINE_ID)
    modular_pipeline_node.internal_inputs.add("internal_input")
    modular_pipeline_node.internal_outputs.add("internal_output")
    modular_pipeline_node.external_inputs.add("external_input")
    modular_pipeline_node.external_outputs.add("external_output")
    tree = {modular_pipeline_id: modular_pipeline_node}
    expanded_tree = modular_pipelines_services.expand_tree(tree)

    # the parent node created by the algorithm should inherit the inputs and outputs of the child
    assert expanded_tree["uk"].internal_inputs == {"internal_input"}
    assert expanded_tree["uk"].internal_outputs == {"internal_output"}
    assert expanded_tree["uk"].external_inputs == {"external_input"}
    assert expanded_tree["uk"].external_outputs == {"external_output"}
