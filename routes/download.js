const router = require("express").Router();
const path = require('path');
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const mime = require('mime');
const { google } = require('googleapis')
const dotenv = require("dotenv");
const getfilelist = require("google-drive-getfilelist");
const User = require('../models/User')
const admz = require('adm-zip')
const zip = require('zip-a-folder').zip
const archiver = require('archiver')

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});


// Download All files

// const downloadSingleFile = async (fileId, fileLoc) => {
//     console.log("downloadSingleFile")

//     return drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' });
// }

// router.get("/files", async (req, res) => {
//     console.log("Inside Download File")
//     try {
//         const batch = req.query.batch
//         console.log(batch)
//         const userData = await User.find({ batch: batch })
//         console.log(userData[0])
//         // const fileList = []

//         // await Promise.all(userData.map(async (user) => {
//         //     const contents = await downloadSingFile(user.merged_file_id, path.join(__dirname, 'data', user.username + ".pdf"));
//         //     console.log(contents)
//         //   }));


//         for (let i = 0; i < userData.length; i++) {
//             console.log("i = " + i);
//             let fileLoc = path.join(__dirname, 'data', userData[i].username + ".pdf");
//             const op = await downloadSingleFile(userData[i].merged_file_id, path.join(__dirname, 'data', userData[i].username + ".pdf"));
//             var dest = fs.createWriteStream(fileLoc);
//             //console.log(typeof(op.data))
//             await op.data.pipe(dest);
//             console.log("op = " + i);
//             //dest.write(op.data);
//             //console.log(op.data)
//         }

//         console.log("cp1")

//         var output = fs.createWriteStream(__dirname + '/target.zip');
//         var archive = archiver('zip');

//         output.on('close', function () {
//             console.log(archive.pointer() + ' total bytes');
//             console.log('archiver has been finalized and the output file descriptor has closed.');
//         });

//         archive.on('error', function (err) {
//             throw err;
//         });

//         archive.pipe(output);

//         // append files from a sub-directory, putting its contents at the root of archive
//         archive.directory(__dirname + "/data", false);

//         // append files from a sub-directory and naming it `new-subdir` within the archive
//         //archive.directory('subdir/', 'new-subdir');

//         archive.finalize();









        // await zip(path.join(__dirname, 'data'), path.join(__dirname, 'archive.zip'));
        // var zip = new admz();

        // for (var i = 0; i < userData.length; i++) {
        //     const res = zip.addLocalFile(path.join(__dirname, 'data', userData[i].username+".pdf"));
        //     console.log(i + ": " + res);
        // }
        // zip.writeZip(path.join(__dirname, 'data', "files"+".zip"));
        // console.log("zp: ");
        // const file_after_download = 'downloaded_file.zip';

        // const data = zp.toBuffer();

        // res.set('Content-Type', 'application/octet-stream');
        // res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
        // res.set('Content-Length', data.length);
        // res.send(data);


        // for (let i = 0; i < userData.length; i++) {
        //     var fileId = userData[i].merged_file_id;
        //     var fileName = userData[i].username + ".pdf"
        //     var dest = fs.createWriteStream(path.join(__dirname, fileName));
        //     drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' },
        //         function (err, res1) {
        //             res1.data
        //                 .on('end', () => {
        //                     console.log('Done');
        //                     // fileList.push(fileName)
        //                 })
        //                 .on('error', err => {
        //                     console.log('Error', err);
        //                     res.status(500).json({})
        //                 })
        //                 .pipe(dest);
        //         }
        //     ).then((response) => {
        //         console.log(response)
        //     })

        // }
//         res.status(200).json(userData)
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).json({});
//     }
// });


router.get("/single_file", async (req, res) => {
    console.log("Inside Download File")
    try {
        const username = req.query.username;
        const userData = await User.findOne({ username: username })

        if (userData) {
            const fileLoc = path.join(__dirname, 'data', userData.username + ".pdf")
            var fileId = userData.merged_file_id;
            var fileName = userData.username + ".pdf"
            var dest = fs.createWriteStream(path.join(__dirname, fileName));
            drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' },
                function (err, res1) {
                    res1.data
                        .on('end', () => {
                            console.log('Done');
                            const file = path.join(__dirname, fileName);
                            console.log(file)

                            var filename = path.basename(file);
                            var mimetype = mime.getType(file);
                            console.log(filename)
                            console.log(mimetype)

                            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                            res.setHeader('Content-type', mimetype);
                            res.download(file)
                            // fileList.push(fileName)
                        })
                        .on('error', err => {
                            console.log('Error', err);
                            res.status(500).json({})
                        })
                        .pipe(dest);
                }
            )
        }
        //res.status(200).json(userData)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({});
    }
});


module.exports = router;