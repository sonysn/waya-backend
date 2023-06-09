"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ansi_colors_config_1 = require("../ansi-colors-config");
function mongoConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_LOCAL_URL || process.env.MONGODB_SERVERLESS_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log((0, ansi_colors_config_1.info)('Connected to MongoDB!'));
            return mongoose_1.default;
        }
        catch (err) {
            console.error((0, ansi_colors_config_1.errormessage)(`'Error connecting to MongoDB: ${err}`));
            throw err;
        }
    });
}
exports.mongoConnect = mongoConnect;
