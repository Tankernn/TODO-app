const LOGIN_URL = "https://tankernn.eu/login/check_login.php";

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

var handleLoginSubmit = function(data) {
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
}

<LoginForm onLoginSubmit=handleLoginSubmit />
