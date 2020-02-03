import React, { Component } from 'react';
import { arc, select, interpolate } from 'd3';
import { Button } from 'reactstrap'
import { DetailsInfo, arcGenerator, expander, collapser, complementaryColors, oppositeColors } from './sunburst.model';
import './SunburstComponent.scss';
class SunburstComponent extends Component {
    // @Input() data: SunburstData;
    // @ViewChild('gElement') gElement: ElementRef;
    dataMissing = {};
    cntr = 0;
    mouseHover = false;

    componentWillReceiveProps(newProps) {
        console.log('data')
        console.log(this.props.data);
        if (this.props.data && this.props.data.data && this.props.data.componentType) {
            setTimeout(() => this.generateArcs(this.props.data.data, this.props.data.componentType), 100)
        }
    }
    render() {
        return (
            <React.Fragment>
                <Button onClick={() => console.log('called')}></Button>
                <svg viewBox="0 0 300 300" preserveAspectRatio="none" width="100%">
                    <text
                        className={!this.props.data || !this.props.data.componentType || this.dataMissing[this.props.data.componentType] ? 'app-sunburst-show' : 'app-sunburst-hidden'}
                        x="75" y="140" font-family="sans-serif" font-size="20px"
                        fill="red">No records found</text>
                    <g ref="gElement" transform="translate(150,150)"></g>
                </svg >
                {
                    this.props.data && this.props.data.componentType &&
                    <div class="app-sunburst-label" > {this.props.data.componentType} </div>
                }
            </React.Fragment >
        )
    }
    generateArcs(data, title) {
        this.colors = complementaryColors;
        if (this.props.data.data.length <= oppositeColors.length) {
            this.colors = oppositeColors;
        }
        const selectedG = select(this.refs.gElement);
        let arcId = 0;
        const textData = [{
            id: 'flexText' + title,
            text: '',
            translate: 15
        },
        {
            id: 'valText' + title,
            text: '',
            translate: -15
        }]

        selectedG
            .selectAll('path')
            .remove();
        let total = 0;
        const ruleTotal = {};
        let initAngle = 0;
        let arcData = [];
        data.forEach(rule => {
            total += rule.count;
            ruleTotal[rule.name] = ruleTotal[rule.name]
                ? ruleTotal[rule.name] + rule.count
                : rule.count;
        });
        // if total is greater than 0
        if (total === 0) {
            this.dataMissing[title] = true;
            return;
        }
        this.dataMissing[title] = false;

        total = 2 * Math.PI / total;
        // inner ring
        initAngle = 0;
        Object.keys(ruleTotal).forEach((key, index) => {
            // keys = FAIL, WARNING, PASS
            const endAngle = initAngle + ruleTotal[key] * total;
            arcData.push({
                id: title + 'innerarc' + key,
                // color: DetailsInfo[key].color,
                color: this.colors[index],
                startAngle: initAngle,
                endAngle: endAngle,
                innerRadius: 80,
                outerRadius: 85
            })
            initAngle = endAngle;
        });

        // outer radius
        initAngle = 0;
        const list = {};
        Object.keys(ruleTotal).forEach(key => {
            list[key] = data.filter(itm => itm.name === key);
        });
        Object.keys(list).forEach(ruleName =>
            list[ruleName].forEach(rule => {
                // rule.names = FAIL, WARNING, PASS
                const endAngle = initAngle + rule.count * total;
                // arcData.push({
                //     id: title + 'arc' + arcId++,
                //     rule: rule,
                //     parent: title + 'arc' + rule.name,
                //     color: DetailsInfo[rule.name].color,
                //     startAngle: initAngle,
                //     endAngle: endAngle,
                //     innerRadius: 100,
                //     outerRadius: 140
                // })
                initAngle = endAngle;
            })
        );

        // inner radius
        initAngle = 0;
        Object.keys(ruleTotal).forEach((key, index) => {
            // keys = FAIL, WARNING, PASS
            const endAngle = initAngle + ruleTotal[key] * total;
            arcData.push({
                id: title + 'arc' + key,
                rule: {
                    name: key,
                    count: ruleTotal[key],
                    flexName: undefined
                },
                parent: undefined,
                // color: DetailsInfo[key].color,
                color: this.colors[index],
                startAngle: initAngle,
                endAngle: endAngle,
                innerRadius: 80,
                outerRadius: 100
            })
            initAngle = endAngle;
        });
        arcData = Object.assign([], arcData);

        selectedG
            .selectAll('path')
            .data(arcData)
            .enter()
            .append('path')
            .attr('id', d => d.id)
            .attr('d', arcGenerator)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseover', d => {
                selectedG
                    .selectAll('path')
                    .style('opacity', 0.8)
                if (!d.id.includes('inner')) {
                    this.mouseHover = true;
                    if (d.parent) {
                        select('#' + d.parent)
                            .transition()
                            .delay(100)
                            .attr('d', expander)
                            .style('opacity', 1.0)
                    }
                    select('#' + d.id)
                        .transition()
                        .delay(100)
                        .attr('d', expander)
                        .style('opacity', 1.0);

                    select('#flexText' + title)
                        .text((flex) => d.rule.flexName ? d.rule.flexName : 'Total')
                        .style('fill', '#888888')
                        .style('font-size', '20px')
                        .style('opacity', 1)

                    select('#valText' + title)
                        .text((val) => d.rule.count + '')
                        .style('fill', '#565656')
                        .style('font-size', '48px')
                        .style('opacity', 1)
                } else {
                    select('#' + d.id)
                        .style('opacity', 1.0)
                }
            })
            .on('mouseout', d => {
                select('#flexText' + title)
                    .text((flex) => d.rule.flexName ? d.rule.flexName : 'Total')
                    .style('opacity', 0);

                select('#valText' + title)
                    .text((val) => d.rule.count + '')
                    .style('opacity', 0);

                selectedG
                    .selectAll('path')
                    .style('opacity', 1.0)
                if (!d.id.includes('inner')) {
                    this.mouseHover = false;
                    if (d.parent) {

                        select('#' + d.parent)
                            .transition()
                            .delay(100)
                            .attr('d', collapser);
                    }

                    select('#' + d.id)
                        .transition()
                        .delay(100)
                        .attr('d', collapser);
                }
            })
            .on('click', d => {
                this.props.sectionSelect(d);
            })
        // .transition()
        // .delay(function (d, i) {
        //     return i * 800;
        // })
        // .attrTween('d', function (d) {
        //     var i = interpolate(d.startAngle + 0.1, d.endAngle);
        //     return function (t) {
        //         d.endAngle = i(t);
        //         return arc(d);
        //     }
        // })

        selectedG
            .selectAll('text')
            .data(textData)
            .enter()
            .append('text')
            .attr('id', d => d.id)
            .attr('transform', function (d) {
                return 'translate(0,' +
                    d.translate
                    + ')';
            })
            .attr('dy', d => {
                if (d.id.includes('flex')) {
                    return '1.0em'
                } else { return '0.2em' }
            })
            .attr('text-anchor', 'middle')
            .text((d) => d.text)
            .style('font-size', '48px')
            .style('opacity', 1)
            .style('fill', '#0000')
            .style('font-size', '20px')
    }
}

export default SunburstComponent;