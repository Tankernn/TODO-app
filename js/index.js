var React = require('react');
var ReactDOM = require('react-dom');
var Remarkable = require('remarkable');
var DatePicker = require('react-datepicker');
require('react-datepicker/dist/react-datepicker.css');
var Bootstrap = require('react-bootstrap');
var moment = require('moment');
var $ = require('jquery');

var TodoForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: '', deadline: moment(), priority: '1'};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleDateChange: function(date) {
    this.setState({deadline: date});
  },
  handlePriorityChange: function(e) {
    this.setState({priority: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var text = this.state.text.trim();
    var priority = this.state.priority;
    var deadline = this.state.deadline._d.toLocaleDateString();
    console.log(deadline);
    if (!title || !text || !deadline) {
      return;
    }
    this.props.onCommentSubmit({a: 'add', title: title, text: text, deadline: deadline, priority: priority});
    this.setState({title: '', text: '', deadline: moment(), priority: '1'});
  },
  render: function() {
    return (
      <form className="form-inline" name="todoForm" onSubmit={this.handleSubmit}>
        <input
          className="form-control"
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <select className="form-control" value={this.state.priority} onChange={this.handlePriorityChange}>
          <option value="1">First priority</option>
          <option value="2">Second priority</option>
          <option value="3">Not very important</option>
          <option value="4">Only if you are bored</option>
        </select>
        <DatePicker
          placeholder="yyyy-mm-dd"
          selected={this.state.deadline}
          onChange={this.handleDateChange}
        />
        <br />
        <textarea
          className="form-control"
          value={this.state.text}
          onChange={this.handleTextChange}>
        </textarea>
        <br />
        <input className="btn btn-primary" type="submit" value="Add" />
      </form>
    );
  }
});

var LoginForm = React.createClass({
  render: function() {
    return (
      <a href="http://tankernn.eu/login?redirect=http://todo.tankernn.eu">Log In</a>
    );
  }
});

var Item = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },
  render: function() {
    var md = new Remarkable();
    return (
      <div className="item">
        <h2>{this.props.title}</h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
    console.log(this.props.list);
    var itemList = this.props.list.map(function(item) {
      return (
        <Item priority={item.priority} title={item.title} key={item.id}>
          {item.description}
        </Item>
      );
    });
    return (
      <div className="list">
        {itemList}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {list: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        this.setState({list: data.list});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      type: 'POST',
      data: comment,
      success: function(data) {
        if (data.result != 0) {
          console.log("Error in API: " + data.result);
        }
        this.setState({list: data.list});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <main>
        <h1>Tankernn TODO list</h1>
        <TodoForm onCommentSubmit={this.handleCommentSubmit} />
        <TodoList list={this.state.list} />
        <LoginForm />
      </main>
    );
  }
});

ReactDOM.render(<App url="/php/api.php" />, document.getElementById('content'));
