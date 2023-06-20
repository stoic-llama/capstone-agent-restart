require('dotenv').config()

const express = require('express')
const app = express()
const { execShellCommand } = require('./parsers/getNodeStatus')
const { findDeadNodes, isNodeDead } = require('./parsers/getDeadNodes')
const { formattedDateNow } = require('./parsers/getTimestamp')
const { exec } = require('child_process');

app.get("/", (req, res) => {
    res.send("API is alive!")
})

////////////////
//   Routes   //
////////////////

// Remove CORS between :3700 and :4100 difference
// Refer https://stackoverflow.com/questions/46288437/set-cookies-for-cross-origin-requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", "*"); // process.env.CORS_FRONTEND_URL);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
// setup app to process JSON
app.use(express.json())
  
// setup products endpoint/route
app.get('/restart/:id', async (req, res) => {
    let allNodes = []
    let liveNodes = []
    let deadNodes = []
    // get all nodes, dead or alive
    const cmdAll = 'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Status}}|||"'
    // get only live nodes
    const cmdLive = 'docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}|||"'

    // console.log("req.params.id: " + req.params.id)

    try {
        await execShellCommand(cmdAll).then(nodes => { allNodes = nodes })    
        await execShellCommand(cmdLive).then(nodes => { liveNodes = nodes })
        deadNodes = findDeadNodes(liveNodes, allNodes)

        if(isNodeDead(deadNodes, req.params.id)) {
            const cmd = `docker restart ${req.params.id}`
            
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.warn(error);
                    res.status(201).json({message: `Dead node found but could not be restarted. Error: ${error}`})
                }
    
                if (stdout) {
                    console.log(stdout) 
                    let time = formattedDateNow()
                    res.status(201).json({message: `Node ${req.params.id} restarted on ${time}`})
                }

                if (stderr) {
                    console.warn(stderr) 
                    res.status(201).json({message: `Dead node found but could not be restarted. Error: ${stderr}`})
                }
            });   
        } else {
            res.status(400).json({message: "Dead node not found"})
        }
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})



/////////////////
//   Startup   //
/////////////////
const port = process.env.PORT || 9999

// start server at port 5800
app.listen(port, () => console.log(`Server started at ${port}`))