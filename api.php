<?php
$pwdTrue = "abcde";
$pwd     = $_SERVER["HTTP_X_PWD"];
if ($pwdTrue !== $pwd) exit;

@$data = file_get_contents("php://input") or $data = '';
$flName = date("ymd-His").".webm";

if ($data) file_put_contents("video/".$flName, $data);
?>