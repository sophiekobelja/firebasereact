import React, {Component} from 'react';
import Bug from './Bug';
import _ from 'lodash';
//import { Graph } from 'react-d3-graph';
import { Graph } from './react-d3-graph2';
const myConfig = {
    nodeHighlightBehavior: true,
    "panAndZoom": true,
    "staticGraph": false,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue',
        test: 'test'
    },
    link: {
        highlightColor: 'lightblue'
    },
    height: 600,
    width: 1000
};
// graph event callbacks 
const onClickNode = function(nodeId) {
    var script = this.script; 
    var allnodes = document.getElementById("graph-id-graph-container-zoomable").getElementsByClassName("node");
    //console.log(allnodes)
    for (var i = 0; i < allnodes.length; i++) {
      var childnodes = allnodes[i].childNodes
      if (childnodes[0].getAttribute("fill") === "red") {
        childnodes[0].setAttribute("fill", "lightgreen")
      }
    }
    var nodeinfodiv = document.getElementById("nodeinfo")

    var n = document.getElementById(nodeId).childNodes;//.path;//.setAttribute("fill", 'red'); 
    console.log(script);
    n[0].setAttribute("fill", "red")
    console.log(nodeinfodiv)
    if (nodeinfodiv != null) {
      nodeinfodiv.remove();
    }
    var newDiv = document.createElement("div"); 
    newDiv.setAttribute("id", "nodeinfo")
    // and give it some content 
    script.forEach(function(el) {
      var d = document.createElement("div"); 
      var newContent = document.createTextNode("type: " + el.type + " label: " + el.label + " value: " + el.value + " new value: " + el.newValue); 
      d.appendChild(newContent);
      console.log(el);
      // add the text node to the newly created div
      newDiv.appendChild(d);  

    });
    
    // add the newly created element and its content into the DOM 
    var currentDiv = document.getElementById("root"); 
    document.body.insertBefore(newDiv, currentDiv); 
};

const onMouseOverNode = function(nodeId) {
     //window.alert(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function(nodeId) {
     //window.alert(`Mouse out node ${nodeId}`);
};

const onClickLink = function(source, target) {
     //window.alert(`Clicked link between ${source} and ${target}`);
};

const onMouseOverLink = function(source, target) {
     //window.alert(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = function(source, target) {
     //window.alert(`Mouse out link between ${source} and ${target}`);
};


class BugsList extends Component {
  constructor(props){
    super(props);
    this.state = {
      bugs: [],
      bugname: '',
      data: []
    };
  }

  getData(values){
    let bugs = values;
    var edit_script_string = bugs['edit_script'];
    edit_script_string = edit_script_string.replace(/'/g, '"');
    var graph_data_string = bugs['graph_data'];
    graph_data_string = graph_data_string.replace(/'/g, '"');

    //console.log(edit_script);
    var edit_script = JSON.parse(edit_script_string);
    var graph_data = JSON.parse(graph_data_string);
    var oldScript = edit_script['oldScripts'];
    var newScript = edit_script['newScripts'];
    var referencesToRange = edit_script['referencesToRange'];
    var output = {}; 
    output['nodes'] = [];
    output['links'] = [];
    var nodeArray = [];
    var edgeArray = []; 
    var currentAvailableNodeIndex = 0; 
    var originalEdges = graph_data['edges'];
    var references = [];

    var nodeTypeMap = [ 'UNKNOWN', 'CM',  'AM', 'DM', 'AF',  'DF'];
    var edgeTypeMap = ['FIELD_ACCESS', 'METHOD_INVOKE', 'METHOD_OVERRIDE'];

    originalEdges.forEach(function(edge) {
      var src = edge['src'];
      var srcName = src['name'];
      var srcNodeType = nodeTypeMap[src['type']];
      var srcIndex; 
      if (nodeArray[srcName] != undefined) {
        srcIndex = nodeArray[srcName];
      } else {
        nodeArray[srcName] = currentAvailableNodeIndex;
        srcIndex = currentAvailableNodeIndex; 
        currentAvailableNodeIndex++;
        var srcScript = []; 
        var refScript = [];
        var classname = "";
        if (srcNodeType === 'CM' || srcNodeType === 'DM') {
          if (oldScript[srcName] != undefined)
            srcScript = oldScript[srcName];
          console.log(srcName);
          // var regex = /(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/;
          // // var text = 'hello_you and hello_me';
          // var matches = srcName.match(regex);
          // console.log(matches); //=> ['hello_you']
         // preg_match('/(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/', $srcName, $matches, PREG_OFFSET_CAPTURE);
         // $classname = $matches[0][0];
          if (referencesToRange[srcName] != undefined) {
              refScript = referencesToRange[srcName];
          }
          //echo "found reference " . $refScript;
        } 
        else if (srcNodeType === 'AM') {
          if (newScript[srcName] != undefined)
            srcScript = newScript[srcName];
          if (referencesToRange[srcName] != undefined) {
              refScript = referencesToRange[srcName];
          }
          // preg_match('/(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/', $srcName, $matches, PREG_OFFSET_CAPTURE);
          // $classname = $matches[0][0];
        }
        if (classname == undefined || classname == "") {
          // preg_match("/(?<=\.)([^\.]+)(?=\.<init>)/", $srcName, $matches, PREG_OFFSET_CAPTURE);
          // $classname = $matches[0][0];
        }
        if (refScript != undefined && references[srcName] != undefined) {
          //echo "src name " . $srcName . " " . $refScript . "<br>";
          references[srcName] = refScript;
        }
        console.log(srcName);
        if (srcScript != undefined){
          var tst = {"id" : srcName, "type" : srcNodeType, "script" : srcScript, "classname" : classname, "reference" : refScript} ;
          output["nodes"].push(tst);
        }
        else{
          var tst = {"id" : srcName, "type" : srcNodeType, "classname" : classname, "reference" : refScript};
          output["nodes"].push(tst);
        }
        
        }
        var dst = edge['dst'];
        var dstName = dst['name'];
        var dstNodeType = nodeTypeMap[dst['type']];
        var dstIndex; 
        if (nodeArray[dstName] != undefined) {
          dstIndex = nodeArray[dstName];
        } else {
          nodeArray[dstName] = currentAvailableNodeIndex;
          dstIndex = currentAvailableNodeIndex; 
          currentAvailableNodeIndex++;
          var dstScript = []; 
          var refScript = [];
          var classname = "";
          if (dstNodeType === 'CM' || dstNodeType === 'DM') {
            if (oldScript[dstName] != undefined)
              dstScript = oldScript[dstName];
            console.log(dstName);
            // var regex = /(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/;
            // // var text = 'hello_you and hello_me';
            // var matches = dstName.match(regex);
            // console.log(matches); //=> ['hello_you']
           // preg_match('/(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/', $dstName, $matches, PREG_OFFSET_CAPTURE);
           // $classname = $matches[0][0];
            if (referencesToRange[dstName] != undefined) {
                refScript = referencesToRange[dstName];
            }
            //echo "found reference " . $refScript;
          } 
          else if (dstNodeType === 'AM') {
            if (newScript[dstName] != undefined)
              dstScript = newScript[dstName];
            if (referencesToRange[dstName] != undefined) {
                refScript = referencesToRange[dstName];
            }
            // preg_match('/(?<=\.)([^\.]+)(?=\.[A-Za-z]*\()/', $dstName, $matches, PREG_OFFSET_CAPTURE);
            // $classname = $matches[0][0];
          }
          if (classname == undefined || classname == "") {
            // preg_match("/(?<=\.)([^\.]+)(?=\.<init>)/", $dstName, $matches, PREG_OFFSET_CAPTURE);
            // $classname = $matches[0][0];
          }
          if (refScript != undefined && references[dstName] != undefined) {
            //echo "dst name " . $dstName . " " . $refScript . "<br>";
            references[dstName] = refScript;
          }
          if (dstScript != undefined){
            output["nodes"].push({"id" : dstName, "type" : dstNodeType, "script" : dstScript, "classname" : classname, "reference" : refScript});
          }
          else
            output["nodes"].push({"id" : dstName, "type" : dstNodeType, "classname" : classname, "reference" : refScript});
          //      if (count($references) > 0) {
          //          foreach ($references as $r) {
          //              echo "ref [" . $r[0] . ", " . $r[1];
          //              if (count($r) == 4) {
          //                  echo ", " . $r[2] . ", " . $r[3];
          //              }
          //              echo "]";
          //          }
          //      }
          }
          
          var edgeType = edgeTypeMap[edge['type']];
          output["links"].push({'source': srcName, 'target': dstName});//, 'type': edgeType});

      });
      // let data = [];
      // data["links"] = JSON.stringify(output["links"]);
      // data["nodes"] = JSON.stringify(output["nodes"]);
      // let data = o
      console.log(output);
      // console.log(data2);
      let data2 = _(output)
                        .keys()
                        .map(bugKey => {
                          let cloned = _.clone(output[bugKey]);
                          cloned.key = bugKey;
                          return cloned;
                      })
                    .value();
      this.setState({
        data: output
      });
  }
  
  componentDidMount() {
    console.log("component mounted");
    console.log(this.props.bug)
    const itemsRef = this.props.db.database().ref('items/1476291_DERBY-6206');
    itemsRef.on('value', (snapshot) => {
      this.getData(snapshot.val());
    });
    
  }

 componentWillReceiveProps(nextProps) {
  if(this.props.bugname != nextProps.bugname) {
    console.log("changed")
    console.log(nextProps)
    this.props = nextProps
    console.log(this.props.bugname) 
    const itemsRef = this.props.db.database().ref('items/' + this.props.bugname);
    itemsRef.on('value', (snapshot) => {
      this.getData(snapshot.val());
    });
  }
}

// componentDidUpdate() {
//   var allnodes = document.getElementsByClassName("node");
//     for (var i = 0; i < allnodes.length; i++) {
//       var childnodes = allnodes[i].childNodes
//       console.log(allnodes[i])
//     }
// }


   render() {
    console.log("rendering");
    if (this.state.data.length == 0) {
      return null; 
    }
    console.log(myConfig)
       return (
                <div className='container'>
                    <div className='container__graph'>
                        <div className='container__graph-area'>
                            <Graph
                              id='graph-id' // id is mandatory, if no id is defined rd3g will throw an error
                              data={this.state.data}
                              config={myConfig}
                              onClickNode={onClickNode}
                              onClickLink={onClickLink}
                              onMouseOverNode={onMouseOverNode}
                              onMouseOutNode={onMouseOutNode}
                              onMouseOverLink={onMouseOverLink}
                              onMouseOutLink={onMouseOutLink}/>
                        </div>
                    </div>
                </div>
            );        
  }
}

export default BugsList


