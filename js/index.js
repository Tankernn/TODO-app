var React = require('react');
var ReactDOM = require('react-dom');
var Remarkable = require('remarkable');
var Button = require('react-bootstrap').Button;
var FormControl = require('react-bootstrap').FormControl;
var FormGroup = require('react-bootstrap').FormGroup;
var Panel = require('react-bootstrap').Panel;
var DatePicker = require('react-bootstrap-date-picker');
var $ = require('jquery');

const LOGIN_URL = "https://tankernn.eu/login/check_login.php";
const API_URL = "https://todo.tankernn.eu/php/api.php";

const priorityNames = {1: "danger", 2: "warning", 3: "primary", 4: "success"};

var TodoForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: '', deadline: new Date().toISOString(), priority: '1'};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleDateChange: function(dateString) {
    this.setState({deadline: dateString});
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
    var deadline = this.state.deadline;
    console.log(deadline);
    if (!title || !text || !deadline) {
      return;
    }
    this.props.onCommentSubmit({a: 'add', title: title, text: text, deadline: deadline, priority: priority});
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form className="form-inline" name="todoForm" onSubmit={this.handleSubmit}>
        <FormControl
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <FormControl componentClass="select" value={this.state.priority} onChange={this.handlePriorityChange}>
          <option value="1">First priority</option>
          <option value="2">Second priority</option>
          <option value="3">Not very important</option>
          <option value="4">Only if you are bored</option>
        </FormControl>
        <DatePicker
          value={this.state.deadline}
          onChange={this.handleDateChange}
        />
        <br />
        <FormControl
          componentClass="textarea"
          value={this.state.text}
          onChange={this.handleTextChange} />
        <br />
        <Button bsStyle="primary" type="submit">Add</Button>
      </form>
    );
  }
});

var LoginForm = React.createClass({
  getInitialState: function() {
    return {user: '', pass: ''};
  },
  handleUserChange: function(e) {
    this.setState({user: e.target.value});
  },
  handlePassChange: function(e) {
    this.setState({pass: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var user = this.state.user;
    var pass = this.state.pass;
    if (!user || !pass) {
      return;
    }
    this.props.onLoginSubmit({user: user, pass: pass});
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form id="loginForm" name="loginForm" onSubmit={this.handleSubmit}>
        <FormControl type="text" value={this.state.user} onChange={this.handleUserChange} />
        <FormControl type="password" value={this.state.pass} onChange={this.handlePassChange} />
        <Button bsStyle="primary" type="submit">Log in</Button>
      </form>
    );
  }
});

var Item = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },
  handleEditClick: function() {
    console.log("I wanna edit.");
  },
  render: function() {
    var md = new Remarkable();
    return (
      <Panel header={this.props.title} footer={<FormGroup><Button bsStyle="primary" onClick={this.handleEditClick}>Edit</Button><Button bsStyle="danger">Delete</Button></FormGroup>} bsStyle={priorityNames[this.props.priority]}>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </Panel>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
    console.log(this.props.list);
    var itemList = this.props.list.map(function(item) {
      return (
        <Item priority={item.priority} title={item.title} key={item.id} deadline={item.deadline}>
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
    return {list: [], result: 0};
  },
  updateList: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        this.setState({list: data.list, result: data.result});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.updateList();
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
        this.setState({list: data.list, result: data.result});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.setState({result: 1});
      }.bind(this)
    });
  },
  handleLoginSubmit: function(data) {
    $.ajax({
      url: LOGIN_URL,
      cache: false,
      type: 'POST',
      data: data,
      success: function(result) {
        console.log(result);
        this.forceUpdate();
      }.bind(this)
    });
  },
  render: function() {
    console.log(this.state);
    if (this.state.result != 1)
      return (
        <main>
          <h1>Tankernn TODO list</h1>
          <TodoForm onCommentSubmit={this.handleCommentSubmit} />
          <TodoList list={this.state.list} />
        </main>
      );
    else
      return (
        <main>
          <h1>Tankernn TODO list</h1>
          <LoginForm onLoginSubmit={this.handleLoginSubmit} />
        </main>
      );
  }
});

ReactDOM.render(<App url={API_URL} />, document.getElementById('content'));
