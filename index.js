var svg = d3.select('svg.circle').attr("class", "svg"),
    div = d3.select('div.chart').append("div").attr("class", "tooltip").style("opacity", 0),
    div2 = d3.select('div.chart').append("div").attr("class", "tooltip2").style("opacity", 0),
    tag = d3.select('div.chart').append("svg").attr("class", "tag").style("center", 50 + "px").style("top", 110 + "px");

var margin =20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");;

var color = d3.scaleOrdinal()
  .domain([0, 1, 2])
  .range([ "#EAE6DF", "#7F706E", "#B7A196"])

var pack = d3.pack()
  .size([diameter - margin, diameter - margin])
  .padding(2)

//tag
player_tag = tag.append("text")
.attr("class", "tag_word")
.attr("transform", "translate(50,50)")
.text("玩家");

side_tag = tag.append("text")
.attr("class", "tag_word")
.attr("transform", "translate(50,80)")
.text("聯盟");

role_tag = tag.append("text")
.attr("class", "tag_word")
.attr("transform", "translate(50,110)")
.text("角色");

//color_tag
player_tag_color = tag.append('rect')
.attr("class", "player_tag_color")
.attr("transform", "translate(20,37.5)")

side_tag_color = tag.append('rect')
.attr("class", "side_tag_color")
.attr("transform", "translate(20,67)")

role_tag_color = tag.append('rect')
.attr("class", "role_tag_color")
.attr("transform", "translate(20,96.5)")

d3.json("data.json").then(function(root) {

      root = d3.hierarchy(root)
        .sum(d => d.value)

      var nodes = pack(root).descendants(),
          focus = root,
          view;

      var circle = g
        .selectAll('circle')
        .data(nodes)
        .enter()

        .append('circle')
        .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root")
        .style("fill", d => d.children ? color(d.depth) : "#F9EAE1")
        .on('mouseover', d => mouseover(d))
        .on('mouseout', d => mouseout(d))
        .on('click',d => d.data.player ? focus !== d && (click(d),zoom(d), d3.event.stopPropagation()) :
                                          focus !== d && (click(d.parent),zoom(d), d3.event.stopPropagation()));

      var text = g
        .selectAll("text")
        .data(nodes)
        .enter();

      text
      .append("text")
      .attr("class", "label")

      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .attr("dy", "0em")
      .text(d => d.data.name!= "" && d.parent ? d.children ? (d.data.rate!="" ? "[ " + d.data.name + " ]" : d.data.name)
                                                              : "[ " + d.data.name + " ] ": "");

      text
      .append("text")
      .attr("class", "label2")

      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .attr("dy", "1.5em")
      .text(d => d.data.name!= "" && d.parent ? d.children ? (d.data.rate!="" ?  d.data.round + "場 / " + d.data.rate + "%": "" )
                                                              : d.data.value + "場 / " + d.data.rolerate + "%" : "");

      var node = g.selectAll("circle,text");

      svg
      .style("background", color(-1))
      .on("click", () => zoom(root));

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoomTo(v) {
        var k = diameter / v[2];
        view = v;

        node.attr("transform", d => "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")");
        circle.attr("r", d => d.r * k);
      }

      function zoom(d,i) {
        var focus0 = focus;
        focus = d;

        var transition = svg.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", d => {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2+ margin]);
              return t => zoomTo(i(t));
            });

        transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
          .style("fill-opacity", d => d.parent === focus ? 1 : 0)
          .on("start", function(d){ if (d.parent === focus) this.style.display = "inline";})
          .on("end", function(d){ if (d.parent !== focus) this.style.display = "none";});
      }

      function mouseover(d){
          div.transition()
          .duration(200)
          .style("opacity", 0.9);

          div.html("[ " + d.data.name + " ]" + "<br/>" + "總場數：" + d.data.round + "<br/>" + "勝場：" + d.data.win + "<br/>" + "勝率：" + d.data.winrate + "%")
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 120) + "px");
      }

      function mouseout(d) {
          div.transition()
          .style("opacity", 0);
      }

      function click(d){
            div2.transition()
            .duration(200)
            .style("opacity", 0.9);

            div2
            .style("left", 150 + "px")
            .style("top",  200 + "px")
            .html("【 " + d.data.name + " 】" + "<br/>"
                      + "總場數：" + d.data.round + "<br/>"
                      + "勝場：" + d.data.win + "&emsp;"
                      + "/ 勝率：" + d.data.winrate + "%" + "<br/><br/>"

                      + "[ @ 正義聯盟 ]" + "<br/>"
                      + "場數：" + d.data.children[0].round + "&emsp;"
                      + "/ 機率：" + d.data.children[0].rate + "%" + "<br/>"
                      + "勝場：" + d.data.children[0].win + "&emsp;"
                      + "/ 勝率：" + d.data.children[0].winrate  + "%" + "<br/>"

                      + "角色（場數/機率）：" + "<br/>"
                      + "&emsp;&emsp;熊：" + d.data.children[0].children[0].value + " / " + d.data.children[0].children[0].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;預言家：" + d.data.children[0].children[1].value + " / " + d.data.children[0].children[1].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;女巫：" + d.data.children[0].children[2].value + " / " + d.data.children[0].children[2].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;獵人：" + d.data.children[0].children[3].value + " / " + d.data.children[0].children[3].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;騎士：" + d.data.children[0].children[4].value + " / " + d.data.children[0].children[4].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;禁言長老：" + d.data.children[0].children[5].value + " / " + d.data.children[0].children[5].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;愛神：" + d.data.children[0].children[6].value + " / " + d.data.children[0].children[6].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;守墓人：" + d.data.children[0].children[7].value + " / " + d.data.children[0].children[7].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;平民：" + d.data.children[0].children[8].value + " / " + d.data.children[0].children[8].rolerate + "%" + "<br/><br/>"

                      + "[ @ 邪惡聯盟 ]" + "<br/>"
                      + "場數：" + d.data.children[1].round + "&emsp;"
                      + "/ 機率：" + d.data.children[1].rate + "%" + "<br/>"
                      + "勝場：" + d.data.children[1].win + "&emsp;"
                      + "/ 勝率：" + d.data.children[1].winrate + "%" + "<br/>"

                      + "角色（場數/機率）：" + "<br/>"
                      + "&emsp;&emsp;小狼：" + d.data.children[1].children[0].value + " / " + d.data.children[1].children[0].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;雪狼：" + d.data.children[1].children[1].value + " / " + d.data.children[1].children[1].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;狼王：" + d.data.children[1].children[2].value + " / " + d.data.children[1].children[2].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;狼美人：" + d.data.children[1].children[3].value + " / " + d.data.children[1].children[3].rolerate + "%" + "<br/>"
                      + "&emsp;&emsp;石像鬼：" + d.data.children[1].children[4].value + " / " + d.data.children[1].children[4].rolerate + "%");
      }
});
