const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

async function build() {
    const context = await esbuild.context({
        entryPoints: ['client/index.tsx'],
        bundle: true,
        outfile: 'public/app.js',
        minify: !isWatch,
        sourcemap: isWatch,
        target: ['es2020'],
        loader: {
            '.tsx': 'tsx',
            '.ts': 'ts',
            '.jsx': 'jsx',
            '.js': 'js',
            '.css': 'css'
        },
        define: {
            'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
        }
    });

    if (isWatch) {
        await context.watch();
        console.log('⚡ Watching client files for changes...');
    } else {
        const result = await context.rebuild();
        console.log(' Client bundle created successfully: public/app.js');
        await context.dispose();
    }
}

build().catch((err) => {
    console.error('Build error:', err);
    process.exit(1);
});

