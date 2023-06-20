function findDeadNodes(liveNodes, allNodes) {
    let deadNodes = []

    if (liveNodes.length > 0) {
        for(i = 0; i < allNodes.length; i++) {
            if( !inNodesArr(liveNodes, allNodes[i]) ) {
                deadNodes.push(allNodes[i])
            }  
        }
    }

    if( liveNodes.length === 0) {
        allNodes.forEach( node => {
            deadNodes.push(node)
        })
    } 
    
    return deadNodes
}

function isNodeDead(deadNodes, node) {
    return inNodesArr(deadNodes, node)
}

function inNodesArr(nodesArr, nodeID) {
    let found = false    

    nodesArr.forEach( node => {
        if( node.ID === nodeID) {
            found = true
        }
    })

    return found
}


module.exports = { findDeadNodes, isNodeDead }