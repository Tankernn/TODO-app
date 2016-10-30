var React = require('react');
var ReactDOM = require('react-dom');
var Remarkable = require('remarkable');
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var FormControl = require('react-bootstrap').FormControl;
var FormGroup = require('react-bootstrap').FormGroup;
var Panel = require('react-bootstrap').Panel;
var DatePicker = require('react-bootstrap-date-picker');
var dateFormat = require('dateformat');
var $ = require('jquery');

const API_URL = "https://todo.tankernn.eu/php/api.php";

const priorityNames = {1: "danger", 2: "warning", 3: "primary", 4: "success"};

function dateToString(date) {
  return dateFormat(date, "yyyy-mm-dd");
}

var TodoForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: '', deadline: new Date().toISOString(), priority: 1};
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
    var deadline = dateToString(this.state.deadline);
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

var Item = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },
  handleEditClick: function() {
    console.log("I wanna edit.");
  },
  handleDeleteClick: function() {
    console.log("Deleting " + this.props.id);
    this.props.handleDeleteClick(this.props.id);

  },
  render: function() {
    var md = new Remarkable();

    var daysLeft = Math.ceil((new Date(this.props.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 1) {
      daysLeft += " days left.";
    } else if (daysLeft == 1) {
      daysLeft = "One day left.";
    } else if (daysLeft == 0) {
      daysLeft = "Today!";
    } else {
      daysLeft = "Should have been done " + Math.abs(daysLeft) + " day(s) ago."
    }

    return (
      <Panel
        header={<header><span className="deadline">{daysLeft}</span><h3>{this.props.title}</h3></header>}
        footer={
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={this.handleEditClick}>Edit</Button>
            <Button bsStyle="danger" onClick={this.handleDeleteClick}>Delete</Button>
          </ButtonToolbar>
        }
        bsStyle={priorityNames[this.props.priority]}
      >
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </Panel>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
    console.log(this.props.list);
    var onDeleteClick = this.props.onDeleteClick;
    var itemList = this.props.list.map(function(item) {
      return (
        <Item handleDeleteClick={onDeleteClick} priority={item.priority} title={item.title} id={item.id} key={item.id} deadline={item.deadline}>
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
        if (data.hasOwnProperty("message")) {
          console.log("API message: " + data.message);
        }
        this.setState({list: data.list, result: data.result});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.setState({result: 1});
      }.bind(this)
    });
  },
  handleDelete: function(id) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      type: 'POST',
      data: {a: 'rm', id: id},
      success: function(data) {
        this.setState({list: data.list, result: data.result});
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
        <TodoList onDeleteClick={this.handleDelete} list={this.state.list} />
      </main>
    );
  }
});

ReactDOM.render(<App url={API_URL} />, document.getElementById('content'));
