import TEMPLATE from "../../config/template.config";
import EMAIL from "../../config/email.config";
import { firebaseClient } from "components/firebase/firebaseClient";
import { getDownloadURL, ref } from "firebase/storage";

const nodemailer = require("nodemailer");
const Mustache = require("mustache");
const fs = require("fs");
const storage = firebaseClient.storage()
const transporter = nodemailer.createTransport(EMAIL);


function makeFirebaseLink(req){
    const firstStr = req.query.link.substr(0, req.query.link.lastIndexOf("/"));
    const secStr = req.query.link.substr( req.query.link.lastIndexOf("?"), req.query.link.length);
    const linkToken = `${firstStr}%2F${req.query.filename}${secStr}&token=${req.query.token}`;
    return linkToken
}
async function sendemailHandler(req, res) {
    if (req.method === "GET") {
            if(req.query.attachment){
            req.query.linkToken = makeFirebaseLink(req);
            try {
                const template = TEMPLATE[req.query.template];
                const output = Mustache.render(template.body, req.query);
                const from = TEMPLATE["from"];
                const info = await transporter.sendMail({
                from: from,
                replyTo: req.query.replyTo,
                to: req.query.email,
                subject: template.subject,
                html: output,
                attachments: [{
                    filename: req.query.filename,
                    path: req.query.linkToken
                }]
            });
            res.status(200).json({result: "OK", info});
            } catch (error) {
                console.error(req.query, error);
                res.status(200).send({result: "OK", info: error.message});
            }}else{
         
        try {
            const template = TEMPLATE[req.query.template];
            const output = Mustache.render(template.body, req.query);
            const from = TEMPLATE["from"];
            const info = await transporter.sendMail({
                from: from,
                replyTo: req.query.replyTo,
                to: req.query.email,
                subject: template.subject,
                html: output,
            });
            res.status(200).json({result: "OK", info});
        } catch (err) {
            console.error(req.query, err);
            res.status(200).send({result: "OK", info: err.message});
        }}
    }
}

export default sendemailHandler;
