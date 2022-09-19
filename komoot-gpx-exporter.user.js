// ==UserScript==
// @name         Komoot GPX Exporter
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  allows to export routes as a GPX file
// @author       foxylion
// @include      https://www.komoot.*/*
// @downloadURL  https://github.com/foxylion/tampermonkey/raw/master/komoot-gpx-exporter.user.js
// ==/UserScript==

(function () {
    const escapeXml = (unsafe) => {
        return unsafe.replace(/[<>&'"#]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                case '#': return '&#35;';
            }
        });
    };

    const createXmlString = (title, coordinates, pois, highlights) => {
        let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker">\n';
        result += '<metadata/>\n';
        result += `<trk><name>${escapeXml(title)}</name><desc></desc>\n`;
        result += '<trkseg>\n';
        result += coordinates.map((point) => `<trkpt lat="${point.lat}" lon="${point.lng}"><ele>${point.alt}</ele></trkpt>`).join('\n');
        result += '\n</trkseg>\n';
        result += '</trk>\n';
        result += pois.map((poi) => `<wpt lat="${poi.location.lat}" lon="${poi.location.lng}"><name>${poi.name}</name></wpt>`).join('\n');
        result += '\n';
        result += highlights.map((highlight) => `<wpt lat="${highlight.mid_point.lat}" lon="${highlight.mid_point.lng}"><name>${escapeXml(highlight.name)}</name></wpt>`).join('\n');
        result += '\n</gpx>';
        return result;
    }

    const downloadGpxFile = (title, xml) => {
        const url = 'data:text/json;charset=utf-8,' + xml;
        const link = document.createElement('a');
        link.download = `${title}.gpx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
    };

    const html = document.createElement('div');
    html.style.position = 'absolute';
    html.style.top = '0px';
    html.style.left = '50%';
    html.style.zIndex = 1000;
    html.innerHTML = '<button style="background-color: #fff; padding: 5px;margin-top: 5px;border-radius:3px" id="export-gpx">Export GPX</button>';
    document.body.append(html);
    document.getElementById('export-gpx').onclick = function () {
        const [all , g1, smart, id] = window.location.href.match(/\/((smart)?tour)\/([0-9]+)/);
        const type = smart ? 'smart_tours' : 'tours';
        const store = kmtBoot.getProps().page.store;
        const title = document.getElementById('title').textContent;
        const coordinates = store.moc[`//api.komoot.de/v007/${type}/${id}/coordinates`].attributes.items;
        const pois = Object.keys(store.moc).filter(key => key.match(/.*pois\/[a-z0-9]+$/i)).map(key => store.moc[key].attributes);
        const highlights = Object.keys(store.moc).filter(key => key.match(/.*highlights\/[a-z0-9]+$/i)).map(key => store.moc[key].attributes);
        const xml = createXmlString(title, coordinates, pois, highlights);
        downloadGpxFile(title, xml);
    };
})();
