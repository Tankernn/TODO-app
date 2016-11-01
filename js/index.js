var React = require('react');
var ReactDOM = require('react-dom');
var Remarkable = require('remarkable');
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var FormControl = require('react-bootstrap').FormControl;
var FormGroup = require('react-bootstrap').FormGroup;
var Panel = require('react-bootstrap').Panel;
var Modal = require('react-bootstrap').Modal;
var DatePicker = require('react-bootstrap-date-picker');
var dateFormat = require('dateformat');
var $ = require('jquery');

const API_URL = "https://todo.tankernn.eu/php/api.php";

const priorityNames = {1: "danger", 2: "warning", 3: "info", 4: "success"};

function dateToString(date) {
  return dateFormat(date, "yyyy-mm-dd");
}

var TodoForm = React.createClass({
  getInitialState: function() {
    return {showModal: false, title: this.props.title, text: this.props.text, deadline: this.props.deadline, priority: this.props.priority};
  },
  getDefaultProps: function()  {
    return {edit: false};
  },
  closeModal() {
    this.setState({ showModal: false });
  },
  openModal() {
    this.setState({ showModal: true });
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleDateChange: function(dateString) {
    this.setState({deadline: dateString});
    console.log(dateToString(dateString));
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
    this.props.onCommentSubmit({a: (this.props.edit ? 'edit' : 'add'), id: -1, title: title, text: text, deadline: deadline, priority: priority});
    this.closeModal();
    if (!this.props.edit)
      this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <div>
        <Button bsStyle="primary" onClick={this.openModal}>{this.props.edit ? "Edit" : "Add"}</Button>

        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <form name="todoForm" onSubmit={this.handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>TODO-Form</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormControl
                type="text"
                placeholder="Title"
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
              <FormControl componentClass="select" value={this.state.priority} onChange={this.handlePriorityChange}>
                <option value={1}>First priority</option>
                <option value={2}>Second priority</option>
                <option value={3}>Not very important</option>
                <option value={4}>Only if you are bored</option>
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
            </Modal.Body>
            <Modal.Footer>
              <ButtonToolbar>
                <Button bsStyle="primary" type="submit">Save</Button>
                <Button onClick={this.closeModal}>Cancel</Button>
              </ButtonToolbar>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
});

var Item = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },
  handleEditSubmit: function(data) {
    data.a = 'edit';
    data.id = this.props.id;
    this.props.handleEditSubmit(data);
  },
  handleDeleteClick: function() {
    console.log("Deleting " + this.props.id);
    this.props.handleDeleteClick(this.props.id);
  },
  render: function() {
    var md = new Remarkable();

    var daysLeft = Math.ceil((new Date(this.props.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    if (isNaN(daysLeft)) {
      daysLeft = "No deadline.";
    } else if (daysLeft > 1) {
      daysLeft += " days left.";
    } else if (daysLeft == 1) {
      daysLeft = "One day left.";
    } else if (daysLeft == 0) {
      daysLeft = "Deadline today!";
    } else {
      daysLeft = "Should have been done " + Math.abs(daysLeft) + " day(s) ago."
    }

    var deadline = new Date(this.props.deadline);
    if (isNaN(deadline))
      deadline = new Date();

    var todoForm =  <TodoForm
                      title={this.props.title}
                      text={this.props.children.toString()}
                      deadline={deadline.toISOString()}
                      priority={this.props.priority}
                      onCommentSubmit={this.handleEditSubmit}
                      edit={true}
                    />;

    return (
      <Panel
        header={<header><span className="deadline">{daysLeft}</span><h3>{this.props.title}</h3></header>}
        footer={
          <ButtonToolbar>
            {todoForm}
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
    var handleEditSubmit = this.props.handleEditSubmit;
    var itemList = this.props.list.map(function(item) {
      return (
        <Item handleDeleteClick={onDeleteClick} handleEditSubmit={handleEditSubmit} priority={item.priority} title={item.title} id={item.id} key={item.id} deadline={item.deadline}>
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
        // Not logged in
        if (data.result == 1) {
          document.location.href = "https://tankernn.eu/login/";
        }
        // Success
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
        <TodoForm title={""} text={""} deadline={new Date().toISOString()} priority={1} onCommentSubmit={this.handleCommentSubmit} />
        <TodoList onDeleteClick={this.handleDelete} handleEditSubmit={this.handleCommentSubmit} list={this.state.list} />
      </main>
    );
  }
});

ReactDOM.render(<App url={API_URL} />, document.getElementById('content'));
