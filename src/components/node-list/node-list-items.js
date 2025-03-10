import utils from '@quantumblack/kedro-ui/lib/utils';
import { createSelector } from 'reselect';
import { sidebarElementTypes, sidebarGroups } from '../../config';
import IndicatorIcon from '../icons/indicator';
import IndicatorOffIcon from '../icons/indicator-off';
import IndicatorPartialIcon from '../icons/indicator-partial';
import InvisibleIcon from '../icons/invisible';
import VisibleIcon from '../icons/visible';
const { escapeRegExp, getHighlightedText } = utils;

export const isTagType = (type) => type === 'tag';
export const isElementType = (type) => type === 'elementType';
export const isGroupType = (type) => isElementType(type) || isTagType(type);

/**
 * Get a list of IDs of the visible nodes from all groups
 * @param {object} nodeGroups Grouped lists of nodes by type
 * @return {array} List of node IDs
 */
export const getNodeIDs = (nodeGroups) =>
  Object.values(nodeGroups).flatMap((nodes) => nodes.map((node) => node.id));

/**
 * Add a new highlightedLabel field to each of the node objects
 * @param {object} nodeGroups Grouped lists of nodes by type
 * @param {string} searchValue Search term
 * @return {object} The grouped nodes with highlightedLabel fields added
 */
export const highlightMatch = (nodeGroups, searchValue) => {
  const highlightedGroups = {};

  for (const type of Object.keys(nodeGroups)) {
    highlightedGroups[type] = nodeGroups[type].map((node) => ({
      ...node,
      highlightedLabel: getHighlightedText(node.name, searchValue),
    }));
  }

  return highlightedGroups;
};

/**
 * Check whether a node matches the search text or true if no search value given
 * @param {object} node
 * @param {string} searchValue
 * @return {boolean} True if node matches or no search value given
 */
export const nodeMatchesSearch = (node, searchValue) => {
  if (searchValue) {
    return new RegExp(escapeRegExp(searchValue), 'gi').test(node.name);
  }

  return true;
};

/**
 * Return only the results that match the search text
 * @param {object} nodeGroups Grouped lists of nodes by type
 * @param {string} searchValue Search term
 * @return {object} Grouped nodes
 */
export const filterNodeGroups = (nodeGroups, searchValue) => {
  const filteredGroups = {};

  for (const nodeGroupId of Object.keys(nodeGroups)) {
    filteredGroups[nodeGroupId] = nodeGroups[nodeGroupId].filter((node) =>
      nodeMatchesSearch(node, searchValue)
    );
  }

  return filteredGroups;
};

/**
 * Return filtered/highlighted nodes, and filtered node IDs
 * @param {object} nodeGroups Grouped lists of nodes by type
 * @param {string} searchValue Search term
 * @return {object} Grouped nodes, and node IDs
 */
export const getFilteredNodes = createSelector(
  [(state) => state.nodes, (state) => state.searchValue],
  (nodeGroups, searchValue) => {
    const filteredGroups = filterNodeGroups(nodeGroups, searchValue);
    return {
      filteredNodes: highlightMatch(filteredGroups, searchValue),
      nodeIDs: getNodeIDs(filteredGroups),
    };
  }
);

/**
 * Return filtered/highlighted tags
 * @param {object} tags List of tags
 * @param {string} searchValue Search term
 * @return {object} Grouped tags
 */
export const getFilteredTags = createSelector(
  [(state) => state.tags, (state) => state.searchValue],
  (tags, searchValue) =>
    highlightMatch(filterNodeGroups({ tag: tags }, searchValue), searchValue)
);

/**
 * Return filtered/highlighted tag list items
 * @param {object} filteredTags List of filtered tags
 * @return {array} Node list items
 */
export const getFilteredTagItems = createSelector(
  [getFilteredTags, (state) => state.tagNodeCounts],
  (filteredTags, tagNodeCounts = {}) => ({
    tag: filteredTags.tag.map((tag) => ({
      ...tag,
      type: 'tag',
      visibleIcon: IndicatorIcon,
      invisibleIcon: IndicatorOffIcon,
      active: false,
      selected: false,
      faded: false,
      visible: true,
      disabled: false,
      checked: tag.enabled,
      count: tagNodeCounts[tag.id] || 0,
    })),
  })
);

/**
 * Return filtered/highlighted element types
 * @param {string} searchValue Search term
 * @return {object} Grouped element types
 */
export const getFilteredElementTypes = createSelector(
  [(state) => state.searchValue],
  (searchValue) =>
    highlightMatch(
      filterNodeGroups(
        {
          elementType: Object.entries(sidebarElementTypes).map(
            ([type, name]) => ({
              id: type,
              name,
            })
          ),
        },
        searchValue
      ),
      searchValue
    )
);

/**
 * Return filtered/highlighted element type items
 * @param {object} filteredTags List of filtered element types
 * @param {array} nodeTypes List of node types
 * @return {object} Element type items
 */
export const getFilteredElementTypeItems = createSelector(
  [getFilteredElementTypes, (state) => state.nodeTypes],
  (filteredElementTypes, nodeTypes) => ({
    elementType: filteredElementTypes.elementType.map((elementType) => {
      const nodeType = nodeTypes.find((type) => type.id === elementType.id);

      return {
        ...elementType,
        type: 'elementType',
        visibleIcon: IndicatorIcon,
        invisibleIcon: IndicatorOffIcon,
        active: false,
        selected: false,
        faded: false,
        visible: true,
        disabled: false,
        checked: nodeType.disabled === false,
        count: nodeType.nodeCount.total,
      };
    }),
  })
);

/**
 * Compares items for sorting in groups first
 * by enabled status (by tag) and then alphabeticaly (by name)
 * @param {object} itemA First item to compare
 * @param {object} itemB Second item to compare
 * @return {number} Comparison result
 */
const compareEnabledThenAlpha = (itemA, itemB) => {
  const byEnabledTag = Number(itemA.disabledTag) - Number(itemB.disabledTag);
  const byAlpha = itemA.name.localeCompare(itemB.name);
  return byEnabledTag !== 0 ? byEnabledTag : byAlpha;
};

/**
 * Compares items for sorting in groups first
 * by enabled status (by tag) and then alphabeticaly (by name)
 * @param {object} itemA First item to compare
 * @param {object} itemB Second item to compare
 * @return {number} Comparison result
 */
export const getFilteredNodeItems = createSelector(
  [
    getFilteredNodes,
    (state) => state.nodeSelected,
    (state) => state.focusMode,
    (state) => state.inputOutputDataNodes,
  ],
  ({ filteredNodes }, nodeSelected, focusMode, inputOutputDataNodes) => {
    const filteredNodeItems = {};

    for (const type of Object.keys(filteredNodes)) {
      filteredNodeItems[type] = filteredNodes[type]
        .map((node) => {
          const checked = !node.disabledNode;
          const disabled =
            node.disabledTag ||
            node.disabledType ||
            (focusMode !== null && !!inputOutputDataNodes[node.id]);

          return {
            ...node,
            visibleIcon: VisibleIcon,
            invisibleIcon: InvisibleIcon,
            active: undefined,
            selected: nodeSelected[node.id],
            faded: disabled || node.disabledNode,
            visible: !disabled && checked,
            checked,
            disabled,
          };
        })
        .sort(compareEnabledThenAlpha);
    }

    return filteredNodeItems;
  }
);

/**
 * Returns group items for each sidebar filter group defined in the sidebar config.
 * @param {object} items List items by group type
 * @return {array} List of groups
 */
export const getGroups = createSelector([(state) => state.items], (items) => {
  const groups = {};

  for (const [type, name] of Object.entries(sidebarGroups)) {
    const itemsOfType = items[type] || [];
    const allUnchecked = itemsOfType.every((item) => !item.checked);
    const allChecked = itemsOfType.every((item) => item.checked);

    groups[type] = {
      type,
      name,
      id: type,
      kind: 'filter',
      allUnchecked: itemsOfType.every((item) => !item.checked),
      allChecked: itemsOfType.every((item) => item.checked),
      checked: !allUnchecked,
      visibleIcon: allChecked ? IndicatorIcon : IndicatorPartialIcon,
      invisibleIcon: IndicatorOffIcon,
    };
  }

  return groups;
});

/**
 * Returns filtered/highlighted items for nodes & tags
 * @param {object} filteredNodeItems List of filtered nodes
 * @param {object} filteredTagItems List of filtered tags
 * @param {object} getFilteredElementTypeItems List of filtered element type items
 * @return {array} final list of all filtered items from the three filtered item sets
 */
export const getFilteredItems = createSelector(
  [getFilteredNodeItems, getFilteredTagItems, getFilteredElementTypeItems],
  (filteredNodeItems, filteredTagItems, filteredElementTypeItems) => ({
    ...filteredTagItems,
    ...filteredNodeItems,
    ...filteredElementTypeItems,
  })
);
