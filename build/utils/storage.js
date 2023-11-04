"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage({
    credentials: {
        private_key: atob(`${process.env.GCS_FILE_PRIVATE_KEY}`),
        client_email: process.env.GCS_FILE_CLIENT_EMAIL,
        client_id: process.env.GCS_FILE_CLIENT_ID,
        universe_domain: process.env.GCS_FILE_UNIVERSE_DOMAIN,
    },
    projectId: process.env.GCS_PROJECT_ID,
});
exports.default = storage;
