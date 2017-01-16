<?php
  header("Access-Control-Allow-Origin: *");

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
    if (isset($_POST['a'])) {
      // Additional actions to perform before returning the list
      switch ($_POST['a']) {
        case 'edit':
          $id = $_POST['id'];
        case 'add':
          $title = $conn->escape_string($_POST['title']);
          $text = $conn->escape_string($_POST['text']);
          $deadline = $_POST['deadline'];
          $priority = $_POST['priority'];
          if (strtotime($deadline) <= time()) {
            $deadline = "";
          }

          if (isset($id)) {
            $sql = "UPDATE Todo SET priority=$priority, deadline='$deadline', title='$title', description='$text' WHERE userid=$userid AND id=$id";
          } else {
            $sql = "INSERT INTO Todo (userid, priority, deadline, title, description) VALUES ($userid, $priority, '$deadline', '$title', '$text')";
          }

          break;
        case 'rm':
          $id = $_POST['id'];

          $sql = "DELETE FROM Todo WHERE id=$id AND userid=$userid";
          break;
      }
      $data->result = $conn->query($sql) ? 0 : $conn->error;
    }
    $sql = "SELECT * FROM Todo WHERE userid=$userid ORDER BY (CASE deadline WHEN '0000-00-00' THEN 1 ELSE 0 END), deadline ASC, priority ASC";
    $query = $conn->query($sql);
    $data->list = array();
    while ($row = $query->fetch_array()) {
      array_push($data->list, $row);
    }
  }

  echo json_encode($data);
?>
