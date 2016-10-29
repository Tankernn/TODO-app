<?php
  session_name('default');
  session_set_cookie_params(0, '/', '.tankernn.eu');
  session_start();

  // Database settings
  require ("db.php");

  $data = new StdClass();

  if (!isset($_SESSION['userid'])) {
    $data->result = 1;
  } else {
    $userid = $_SESSION['userid'];
    if (!isset($_POST['a'])) {
      $data->result = 2;
    } else {
      switch ($_POST['a']) {
        case 'add':
          $title = $_POST['title'];
          $text = $_POST['text'];
          $deadline = $_POST['deadline'];
          $priority = $_POST['priority'];

          $sql = "INSERT INTO Todo (userid, priority, deadline, title, description) VALUES ($userid, $priority, $deadline, '$title', '$text')";

          $data->result = $conn->query($sql) ? 0 : $conn->error;

          break;
        case 'rm':
          $id = $_GET['id'];

          $sql = "DELETE FROM Todo WHERE id=$id";
          break;
      }
    }
    $sql = "SELECT * FROM Todo WHERE userid=$userid";
    $query = $conn->query($sql);
    $data->list = array();
    while ($row = $query->fetch_array()) {
      array_push($data->list, $row);
    }
  }

  echo json_encode($data);
?>
