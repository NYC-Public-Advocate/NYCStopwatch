<?php

$lat = $_REQUEST['lat'];
$lon = $_REQUEST['lon'];

// Connecting, selecting database
$dbconn = pg_connect("host=localhost user=postgres password=rGzole4xTpJEbuIn dbname=gisdb")
    or die('Could not connect: ' . pg_last_error());

// Performing SQL query
// Transforms to (SRID: 26986 Massachusetts state plane meters), which is a good
// approximation for meters since we're near Mass. 1609 meters/mile.
// From: http://postgis.refractions.net/docs/ST_Distance.html
$query = "SELECT (SELECT COUNT(*) as onemi
FROM stopfrisk
WHERE ST_Distance(
   ST_Transform(ST_GeomFromText('POINT($lon $lat)',4326),26986),
   ST_Transform(geom,26986)) / 1609 < 1) as onemi,

(SELECT COUNT(*) as halfmi
FROM stopfrisk
WHERE ST_Distance(
   ST_Transform(ST_GeomFromText('POINT($lon $lat)',4326),26986),
   ST_Transform(geom,26986)) / 1609 < .5) as halfmi;";
   
$result = pg_query($query) or die(isset($_GET['callback']) ? "{$_GET['callback']}(" . json_encode(array('error' => TRUE)) . ")" : json_encode(array('error' => TRUE)));

$return = pg_fetch_array($result, null, PGSQL_ASSOC);

$return['onemi'] = number_format($return['onemi']);
$return['halfmi'] = number_format($return['halfmi']);

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);


header('content-type: application/json; charset=utf-8');

$json = json_encode($return);

echo isset($_GET['callback'])
    ? "{$_GET['callback']}($json)"
    : $json;
?>
