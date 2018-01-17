import React, {Component} from 'react';
import * as d3 from "d3";
import './css/styles.css'

class ReactD3Pack extends Component {
    constructor(props){
        super(props);
        this.state = {
          json: []
        };
      }

    // ------------------------------
    // React lifecycle
    // ------------------------------

    // propTypes: {
    //     json: React.PropTypes.string.isRequired,
    //     startDelay: React.PropTypes.number,
    //     elementDelay: React.PropTypes.number
    // },
    getData() {
         var svg = d3.select("#circlezoom"),
            margin = 20,
            diameter = +svg.attr("width"),
            g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        var color = d3.scaleLinear()
            .domain([-1, 5])
            .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
            .interpolate(d3.interpolateHcl);

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])

        var j = this.state.json;
        console.log(j)
        var root = d3.hierarchy(j)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });
        var focus = root, nodes = pack(root).descendants(), view;

        // Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) {
                var toreturn = d.data.name + " ";
                toreturn += d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                return toreturn;
            })
            //.attr("class", function(d) {return d.data.name;})
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); })
            .on("dblclick", function(d) {
                var tst = "";
                d.data.children.forEach(function (x) {
                    if (x.bugnames != undefined)
                        testFunction(d);
                });

            })
            .on("mouseover", function (d, i) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.data.filepath)
                    .style("left", (d.x) + "px")
                    .style("top", (d.y + 200) + "px");
                handleMouseOver(d, i);
            })
            .on("mouseout", function (d, i) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                handleMouseOut(d, i);
            } );
        //;

        console.log(g)
        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            //.attr("class", "label")
            .attr("class", function(d) {return "label " + d.data.name;})
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .text(function(d) {

                if (d.data.bugnames != undefined) {
                    return d.data.name;
                }
                else
                    return d.data.name;
            });

        var node = g.selectAll("circle,text");

        svg
            .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            //console.log(focus)
            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });

             transition.selectAll("text")
                 .filter(function(d) { if (d != undefined) return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { if (d != undefined) return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d != undefined) if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d != undefined) if (d.parent !== focus) this.style.display = "none"; });
        }


         function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }
        function testFunction(d) {
            //alert("node was double clicked");
            d3.select(".bugnames").style("display", "inline");
        }
        function handleMouseOver(i, d) {
            var disp = d3.selectAll("." + i.data.name).filter( function() {
                return d3.select(this).text();
            });
            disp.style("fill","red");
        }
        function handleMouseOut(i, d) {
            var disp = d3.selectAll("." + i.data.name).filter( function() {
                return d3.select(this).text();
            });
            disp.style("fill","black");
        }
    }


    // React component Mount
    componentDidMount () {
        console.log("component mounted")
        //this.initD3();
        const itemsRef = this.props.db.database().ref('data');
        let json = [];
        itemsRef.on('value', (snapshot) => {
            var pattern = snapshot.val().replace(/'/g, '"');
            var json = JSON.parse(pattern)
            console.log(json)
            this.setState({
                json: json
            });
            this.getData();
        });
        
        
    }

   

    // Render
    render () {
        return (<svg id="circlezoom" width="960" height="960">

            </svg>
        );
    }


}
export default ReactD3Pack