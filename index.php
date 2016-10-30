<?php
  session_name('default');
  session_set_cookie_params(0, '/', '.tankernn.eu');
  session_start();
  if (!isset($_SESSION['userid'])) {
    header("Location: http://tankernn.eu/login?redirect=http://todo.tankernn.eu");
  }
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Tankernn.eu TODO-list</title>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link href="css/style.css" rel="Stylesheet" type="text/css"/>
</head>

<body>
    <div id="content"></div>
    <script type="text/javascript" src="bundle.js"></script>
</body>

</html>
