
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { styleText } from 'node:util';
import { get_game_version } from './src/game_version.js';

const bundle_regex = /dist\/bundle\.js\?version=[^&"]+/;

const style_regex = /style\.css\?version=[^&"]+/;

esbuild
    .build({
        entryPoints: ["src/main.js"],
        bundle: true,
        sourcemap: true,
        minify: true,
        outfile: `dist/bundle.js`,
        platform: "browser",
        target: "es2022",
        format: 'esm',
        logLevel: "debug",
    }).then(() => {
        console.log("Javascript build complete!");
        const htmlPath = 'index.html';
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        /*
            Exit non-zero rather than return. The bundle is already written at this point,
            so returning leaves a new dist/bundle.js on disk with index.html still asking
            for the old ?version= - and dist/ is committed, so that is a bundle no
            browser will fetch, reported as a successful build. Anything chaining off this
            (`node build.js && ...`) could not tell.
        */
        if(htmlContent.search(bundle_regex) == -1) {
            console.error(styleText("red", 'Failed to update the bundle version in .html!'));
            process.exit(1);
        }
        if(htmlContent.search(style_regex) == -1) {
            console.error(styleText("red", 'Failed to update the style version in .html!'));
            process.exit(1);
        }

        htmlContent = htmlContent.replace(
            bundle_regex,
            `dist/bundle.js?version=${get_game_version()}`
        ).replace(
            style_regex,
            `style.css?version=${get_game_version()}`
        );
        try {
            fs.writeFileSync(htmlPath, htmlContent);
            console.log("Bundle and style versions in .html have been updated!");
        } catch (err) {
            //Also non-zero: the bundle is on disk and index.html was not updated.
            console.error(err);
            process.exit(1);
        }
        
    }).catch(() => process.exit(1));

