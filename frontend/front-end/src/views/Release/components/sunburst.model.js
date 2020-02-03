
import { arc } from 'd3';

// export interface Details {
//     name: Status;
//     count: number;
//     flexName: string;
//     device: DeviceType;
// }
// export enum DeviceType {
//     dev1 = 'dev1',
//     dev2 = 'dev2',
//     dev3 = 'dev3',
//     dev4 = 'dev4'
// }
// export enum Status {
//     Fail = 'Fail',
//     Warning = 'Warning',
//     Pass = 'Pass'
// }
// export interface SunburstData {
//     data: any;
//     componentType: DeviceType;
// }
// export class SunburstArcData {
//     id: string;
//     rule: Details;
//     parent: string;
//     color: string;
//     startAngle: number;
//     endAngle: number;
//     innerRadius: number;
//     outerRadius: number;
// }
export const DetailsInfo = {
    Fail: { color: '#ED6648', display: 'Fail' },
    Warning: { color: '#F9D55B', display: 'Warning' },
    Pass: { color: '#68C083', display: 'Pass' },
    Total: { color: '#36A2EB', display: 'Total' },
    // complementary 1 pair
    Storage: { color: 'rgb(242,143,31)', display: 'Storage' },
    Network: { color: 'rgb(32,114,178)', display: 'Network' },
    Management: { color: 'rgb(195,25,126)', display: 'Management' },
    Others: { color: 'rgb(140,189,63)', display: 'Others' },
    // complementary 2 pair
    // Storage: { color: 'rgb(253,199,15)', display: 'Storage' },
    // Network: { color: 'rgb(66,78,155)', display: 'Network' },
    // Management: { color: 'rgb(228,36,38)', display: 'Management' },
    // Others: { color: 'rgb(10,144,93)', display: 'Others' },

};
export const complementaryColors = [
    'rgb(253,199,15)',
    'rgb(242,142,31)',
    'rgb(236,98,36)',
    'rgb(228,36,38)',
    'rgb(195,26,126)',
    'rgb(110,57,141)',
    'rgb(65,78,154)',
    'rgb(32,114,178)',
    'rgb(29,150,187)',
    'rgb(10,144,93)',
    'rgb(140,189,63)',
    'rgb(240,230,12)',
]
export const oppositeColors = [
    'rgb(242,143,31)',
    'rgb(195,25,126)',
    'rgb(32,114,178)',
    'rgb(140,189,63)'
]
export const arcGenerator = arc();
export const innerarc = arc().innerRadius(30).outerRadius(35);
export const expander = arc()
    .innerRadius(d => {
        return (d.innerRadius = d.parent ? d.innerRadius : d.innerRadius);
    })
    .outerRadius(d => {
        return (d.outerRadius += 10);
    });

export const collapser = arc()
    .innerRadius(d => {
        return (d.innerRadius = d.parent ? d.innerRadius : d.innerRadius);
    })
    .outerRadius(d => {
        return (d.outerRadius -= 10);
    });
