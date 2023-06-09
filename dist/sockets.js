"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockets = exports.connectedUsers = exports.connectedUsersIDs = exports.connectedUsersSocketIDs = void 0;
//const { searchForDriversWT, DriverFound, reqBody } = require('./controllers/userActions/requestRide');
const userDriverAction_1 = require("./controllers/userDriverActions/userDriverAction");
const ansi_colors_config_1 = require("./ansi-colors-config");
const _1 = require(".");
exports.connectedUsersSocketIDs = [];
exports.connectedUsersIDs = [];
/*This code defines two classes - LinkedListNode and LinkedListUsersConnected.

LinkedListNode is a class used to create nodes that can be added to the linked list. Each node has an id, a socket and a next pointer.

LinkedListUsersConnected is the main class used to create the linked list data structure. It has a head pointer to the first node in the list,
and a tail pointer to the last node in the list.

The add method adds a new node to the end of the list. It creates a new node with the id and socket passed in as arguments, and then checks if the list is empty.
If it is, it sets both head and tail pointers to the new node. Otherwise, it sets the next pointer of the current tail node to the new node, and then updates the
tail pointer to the new node.

The remove method removes a node with a specific id from the list. It starts by setting current to the head node and previous to null.
It then loops through the list until it finds a node with the id to be removed. Once found, it checks if the node to be removed is the head or the tail.
If it's the tail, it updates the tail pointer to the previous node. If it's the head, it updates the head pointer to the next node. Otherwise, it updates the next pointer of the previous node to the next pointer of the current node, effectively removing the current node from the list.

The getSocket method returns the socket associated with a given id. It loops through the list and returns the socket of the first node with the matching id.
If no match is found, it returns null.

The toArray method converts the linked list to an array of ids. It starts by creating an empty array, and then loops through the list,
adding the id of each node to the array. Once it reaches the end of the list, it returns the array. */
class LinkedListNode {
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.next = null;
    }
}
class LinkedListUsersConnected {
    constructor() {
        this.head = null;
        this.tail = null;
    }
    add(id, socket) {
        // Check if ID already exists in the linked list
        let current = this.head;
        while (current) {
            if (current.id === id) {
                // ID already exists, so don't add a new node
                return;
            }
            current = current.next;
        }
        const node = new LinkedListNode(id, socket);
        if (!this.head) {
            this.head = node;
            this.tail = node;
        }
        else {
            this.tail.next = node;
            this.tail = node;
        }
    }
    remove(socket) {
        let current = this.head;
        let previous = null;
        while (current) {
            if (current.socket === socket) {
                if (previous) {
                    previous.next = current.next;
                    if (current === this.tail) {
                        this.tail = previous;
                    }
                }
                else {
                    this.head = current.next;
                    if (!this.head) {
                        this.tail = null;
                    }
                }
                break;
            }
            previous = current;
            current = current.next;
        }
    }
    getSocket(id) {
        let current = this.head;
        while (current) {
            if (current.id === id) {
                return current.socket;
            }
            current = current.next;
        }
        return null;
    }
    toArray() {
        const array = [];
        let current = this.head;
        while (current) {
            array.push(current.id);
            current = current.next;
        }
        return array;
    }
}
exports.connectedUsers = new LinkedListUsersConnected();
//sockets is a function name
function sockets() {
    _1.io.on("connection", (socket) => {
        //connectedUsersSocketIDs.push(socket.id);
        console.log((0, ansi_colors_config_1.info)(`client connected..., ${socket.id}`));
        //emit is to send, on is to listen
        socket.on("identifyWho", function (id) {
            //console.log(id)
            // connectedUsersIDs.push(id);
            // console.log(connectedUsersIDs);
            exports.connectedUsers.add(id, socket.id);
            console.log(exports.connectedUsers.toArray());
            //console.log(id.slice(6))
        });
        //whenever someone disconnects this gets executed, handle disconnect
        socket.on('disconnect', function () {
            //Find the index of the array element you want to remove using indexOf, and then remove that index with splice.
            // const index = connectedUsersSocketIDs.indexOf(socket.id);
            // const index2 = connectedUsersIDs.indexOf(index);
            // if (index > -1) { // only splice array when item is found
            //     connectedUsersSocketIDs.splice(index, 1); // 2nd parameter means remove one item only
            //     connectedUsersIDs.splice(index2, 1);
            // }
            exports.connectedUsers.remove(socket.id);
            console.log((0, ansi_colors_config_1.info)("disconnected"));
        });
        //this function gets location cordinates and id and pushes it to server in real time
        //from driver
        socket.on('driverLocationUpdates', function (data, id, verificationStatus, driverDestPoint) {
            (0, userDriverAction_1.locationUpdateWT)(data, id, verificationStatus, driverDestPoint);
            //console.log(data, id);
            //console.log(connectedUsersSocketIDs)
            //console.log(DriverFound);
            // const index = connectedUsersIDs.indexOf(DriverFound[0])
            // const driversocket = connectedUsersSocketIDs[index];
            // console.log(driversocket);
        });
        //to find driver during request, just for testing
        socket.on('driversAvailable', function (data) {
            console.log(data);
        });
        //count drivers in the vicinity
        socket.on('driverInfoVicinity', function (data) {
            //searchForDriversWT(data);
            console.log(data);
        });
        socket.on('error', function (err) {
            console.log((0, ansi_colors_config_1.warning)(`Received error from client: ${socket.id}`));
            console.log((0, ansi_colors_config_1.errormessage)(err));
        });
    });
}
exports.sockets = sockets;
