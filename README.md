# GTFStoCartoDB
Node script to download &amp; unzip GTFS data, then use the import API to upload each table to CartoDB.

It does some special processing for stops.txt to make sure the lat and lon columns are recognizable by CartoDB.  All other tables are just uploaded without geospatial data.

##How to Use

- Clone this repo `git clone https://github.com/chriswhong/GTFStoCartoDB.git`
- Create a config.json file based on config.sample.json with your CartoDB username, Api Key, and the URL for a zipped GTFS file
- Install Dependencies `npm install`
- Run the Script `node import.js`

If you are successful, you will see that your tables have been added to the item queue: 

`{"item_queue_id":"0f8eda19-dbc4-4fe9-a56a-9f2d6215d9bc","success":true}`

TODO:  Import is failing because you can only upload 3 files simultaneously... see [issue #1](https://github.com/chriswhong/GTFStoCartoDB/issues/1)
