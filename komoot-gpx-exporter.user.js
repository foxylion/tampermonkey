// ==UserScript==
// @name         Komoot GPX Exporter
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  allows to export routes as a GPX file
// @author       foxylion
// @include      https://www.komoot.*/*
// @downloadURL  https://github.com/foxylion/tampermonkey/raw/master/komoot-gpx-exporter.user.js
// ==/UserScript==

(function () {
    const createXmlString = (title, lines) => {
        let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker">\n';
        result += '<metadata/>\n';
        result += `<trk><name>${title}</name><desc></desc>\n`;
        result += '<trkseg>\n';
        result += lines.map((point) => `<trkpt lat="${point.lat}" lon="${point.lng}"><ele>${point.alt}</ele></trkpt>`).join('\n');
        result += '</trkseg>\n';
        result += '</trk>\n';
        result += '</gpx>';
        return result;
    }

    const downloadGpxFile = (title, lines) => {
        const xml = createXmlString(title, lines);
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
        const title = store.moc[`//api.komoot.de/v007/${type}/${id}`].attributes.name;
        const coordinates = store.moc[`//api.komoot.de/v007/${type}/${id}/coordinates`].attributes.items;
        downloadGpxFile(title, coordinates);
    };
})();
