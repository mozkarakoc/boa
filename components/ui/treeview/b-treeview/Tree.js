import React from 'react';
import InfiniteTree from './InfiniteTree';
import TreeNode from './components/TreeNode';
import Toggler from './components/Toggler';
import NodeIcon from './components/NodeIcon';
import Text from './components/Text';
import Checkbox from './components/Checkbox';
import Radiobox from './components/Radiobox';
import { BComponent, BComponentComposer } from 'b-component';

@BComponentComposer
export class Tree extends BComponent {
  constructor(props, context) {
    super(props, context);
  }
  tree = null;

  handleOnNodeClick(tree, props, node) {
    let isCheckable = node.isCheckable === undefined ? true : node.isCheckable;
    if (props.isLeafCheckable && node.hasChildren()) {
      isCheckable = false;
    }
    if (isCheckable) {
      let checked = !node.isSelected;
      tree.checkNode(node, checked);
      if (props.onCheckNode) {
        props.onCheckNode(node, checked);
      }
    }
  }

  render() {
    let props = this.props;

    return (
      <InfiniteTree
        ref={node => {
          this.tree = node ? node.tree : null;
        }}
        context={props.context}
        style={{ outline: 'none' }}
        data={this.props.data}
        width={props.width}
        height={props.height}
        rowHeight={props.rowHeight}
        expandAll={props.expandAll}
        isMultiSelect={props.isMultiSelect}
        tabIndex={this.props.tabIndex}
        canCheckChildsByParent={this.props.canCheckChildsByParent}
        isLeafCheckable={this.props.isLeafCheckable}
        isSingleCheckable={this.props.isSingleCheckable}
        onOpenNode={props.onOpenNode}
        onCloseNode={props.onCloseNode}
        onSelectNode={props.onSelectNode}
        onWillOpenNode={props.onWillOpenNode}
        onWillCloseNode={props.onWillCloseNode}
        onWillSelectNode={props.onWillSelectNode}
        onContentWillUpdate={props.onContentWillUpdate}
        onScroll={props.onScroll}
        onKeyUp={props.onKeyUp}
        onKeyDown={props.onKeyDown}
        shouldSelectNode={node => {
          // if (!node || node === this.tree.getSelectedNode()) {
          //   return false;
          // }
          console.log(node);
          return true;
        }}
      >
        {({ node, tree }) => {
          return this.renderTreeNode(node, tree, props);
        }}
      </InfiniteTree>
    );
  }

  renderTreeNode(node, tree, props) {
    const hasChildren = node.hasChildren();

    let toggleState = '';
    if ((!hasChildren && node.loadOnDemand) || (hasChildren && !node.state.open)) {
      toggleState = 'closed';
    }
    if (hasChildren && node.state.open) {
      toggleState = 'opened';
    }

    let _checkBox =
      props.isCheckable &&
      (props.isMultiSelect ? (
        <Checkbox
          context={props.context}
          node={node}
          rowHeight={props.rowHeight}
          onChange={(event, isInputChecked) => {
            tree.checkNode(node, isInputChecked);
            if (props.onCheckNode) {
              props.onCheckNode(node, isInputChecked);
            }
          }}
        />
      ) : (
        <Radiobox
          context={props.context}
          node={node}
          rowHeight={props.rowHeight}
          onChange={(event, isInputChecked) => {
            tree.checkNode(node, isInputChecked);
            if (props.onCheckNode) {
              props.onCheckNode(node, isInputChecked);
            }
          }}
        />
      ));

    return (
      <TreeNode
        context={props.context}
        selected={node.state.selected}
        depth={node.state.depth}
        rowHeight={props.rowHeight}
        onClick={() => {
          tree.selectNode(node);
        }}
      >
        <Toggler
          context={props.context}
          state={toggleState}
          rowHeight={props.rowHeight}
          onClick={event => {
            event.stopPropagation();

            if (toggleState === 'closed') {
              tree.openNode(node);
            } else if (toggleState === 'opened') {
              tree.closeNode(node);
            }
          }}
        />
        {props.isLeafCheckable ? node.children.length == 0 && _checkBox : _checkBox}
        {props.showIcons && <NodeIcon state={toggleState} context={props.context} icon={node.icon} rowHeight={props.rowHeight} />}
        <Text
          onClick={() => {
            this.handleOnNodeClick(tree, props, node);
          }}
          rowHeight={props.rowHeight}
          context={props.context}
        >
          {node.detail ? (
            <span style={{ lineHeight: '15px', display: 'inline-block', verticalAlign: 'middle' }}>
              {this.highlightSearchTerm(node)}
              <br />
              <span style={{ color: props.context.theme.boaPalette.base400, fontWeight: '400', fontSize: '12px' }}>{node.detail}</span>
            </span>
          ) : (
            this.highlightSearchTerm(node)
          )}
        </Text>
      </TreeNode>
    );
  }

  wrap(match) {
    return '<span class="highlighted">' + match + '</span>';
  }

  highlightSearchTerm(node) {
    if (this.props.filterText && node.name) {
      let term = this.props.filterText;
      let regex = new RegExp(term, 'gi');
      let p = node.name.replace(regex, match => this.wrap(match));
      return <span dangerouslySetInnerHTML={{ __html: p }} />;
    }
    return node.name;
  }
}

export default Tree;
