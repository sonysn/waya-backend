const { searchForDriversWT, DriverFound } = require('./controllers/userActions/requestRide');
const { locationUpdateWT, notifyDriver } = require('./controllers/userDriverActions/userDriverAction');

const connectedUsersSocketIDs = [];
const connectedUsersIDs = [];
//sockets is a function name
exports.sockets = function sockets() {
    io.on("connection", (socket) => {
        

        connectedUsersSocketIDs.push(socket.id);
        console.log('client connected...', socket.id);

        //emit is to send, on is to listen

        socket.on("identifyWho", function (id) {
            //console.log(id)
            connectedUsersIDs.push(id);
            console.log(connectedUsersIDs);
            //console.log(id.slice(6))
        });

        //whenever someone disconnects this gets executed, handle disconnect
        socket.on('disconnect', function () {
            //Find the index of the array element you want to remove using indexOf, and then remove that index with splice.
            const index = connectedUsersSocketIDs.indexOf(socket.id);
            const index2 = connectedUsersIDs.indexOf(index);
            if (index > -1) { // only splice array when item is found
                connectedUsersSocketIDs.splice(index, 1); // 2nd parameter means remove one item only
                connectedUsersIDs.splice(index2, 1);
            }

            console.log("disconnected");
        });

        //this function gets location cordinates and id and pushes it to server in real time
        //from driver
        socket.on('driverLocationUpdates', function (data, id) {
            locationUpdateWT(data, id);
            //console.log(data, id);
            //console.log(connectedUsersSocketIDs)
            //console.log(DriverFound);
        });

        //to find driver during request, just for testing
        socket.on('driversAvailable', function (data){
            console.log(data);
        })

        //TO NOTIFY DRIVER OF requsted ride
        socket.on('ridenotification', function (data){
            const index = connectedUsersIDs.indexOf(DriverFound[0])
            const driversocket = connectedUsersSocketIDs[1];
            console.log(driversocket);
            //notifyDriver(driversocket)
        })

        //count drivers in the vicinity
        socket.on('driverInfoVicinity', function (data) {
            //searchForDriversWT(data);
            console.log(data)
        });

        socket.on('error', function (err) {
            console.log('received error from client:', client.id)
            console.log(err)
        })
    });

}