
# [ viot(&h) ]

### A Visualization Tool for the Internet of Things (and Humans)

VIOTH is a visualization tool for the Internet of Things (and humans).  It aims to provide an owner of a system a graphical status that system's components.  The components can be anything: computers, automobiles, manufacturing infrastructure or even people.  Any registered component with a means to send sensor data back to VIOTH will be part of the metrics.  The tool's default setup gathers and displays temperature.  When a device is registered, or added to VIOTH, a safe temperature threshold is included with that data.  The device then sends readings to VIOTH either on a schedule or ad hoc and those readings are recorded in a line chart.  Alerts or triggers can configured and then executed if a reading surpasses the component's threshold.

A working example of VIOTH can be accessed [here](https://safe-coast-16974.herokuapp.com).

![vioth-screenshot](https://user-images.githubusercontent.com/34637263/39872070-c6653072-5434-11e8-9169-1acb8c7af773.png)

## Deployment

The application runs on Node.js, just use 'npm start' to get it going.  It relies on MongoDB for its database.  Create a db and configure the path appropriately.  Authentication is built with [JWT](https://jwt.io/).  System managers will register their account in VIOTH and then use the 'Add Component' option to enter a new device for management.  Device readings can be performed manually via the web console or programtically via a script with a tool like [curl](https://curl.haxx.se/) which can make CLI-based RESTful API calls.

## Built With

* [Node.js](http://www.nodejs.org/) - Core build based on Node.js and JavaScript, HTML5 and CSS
* [jQuery](https://maven.jquery.com) - Client-side HTML manipulation and event handlers
* [MongoDB](https://mongodb.com) - User & component details are stored to and retrieved from this document-oriented database
* [Chart.js](https://chartjs.org) - Javascript Chart library that allows for VIOTH bar and line chart dashboards
* [Socket.io](https://socket.io) - Enables real-time updates for all users viewing the dashboard

## Contributing

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Paul Sczurek** - *Initial work* - [pocketcalculator](https://github.com/pocketcalculator)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Casey Capps & Thinkful
