import React from 'react';
import ReactDOM from 'react-dom';
import ProseMirror from 'react-prosemirror';
import 'prosemirror/dist/menu/tooltipmenu';
import 'prosemirror/dist/markdown';

export default class ProseEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log("BOOM");
  }

  componentDidMount() {
      this.setState({content: this.props.content});
  }

  onContentChange(content) {
      this.setState({content});
      this.props.onChange(this.state.content);
  }

  render() {
    return (
      <div id="prose-editor" className="markdown-content">
        <ProseMirror value={this.state.content} onChange={this.onContentChange.bind(this)} options={{docFormat: 'markdown', tooltipMenu: {selectedBlockMenu:true}}} />
      </div>
    );
  }
}
