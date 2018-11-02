"use strict";

const fs = require("fs");
const yaml = require("js-yaml");

const articles = "articles";
const publish = 'publish';
const bookConfig = yaml.safeLoad(fs.readFileSync(`${articles}/config.yml`, "utf8"));

const reviewPrefix = process.env["REVIEW_PREFIX"] || "bundle exec ";
const reviewPostfix = process.env["REVIEW_POSTFIX"] || "";             // REVIEW_POSTFIX="-peg" npm run pdf とかするとPEGでビルドできるよ
const reviewPreproc = `${reviewPrefix}review-preproc${reviewPostfix}`;
const reviewCompile = `${reviewPrefix}review-compile${reviewPostfix}`;
const reviewPdfMaker = `${reviewPrefix}review-pdfmaker${reviewPostfix}`;
const reviewEpubMaker = `${reviewPrefix}review-epubmaker${reviewPostfix}`;

module.exports = grunt => {
	grunt.initConfig({
		clean: {
			review: {
				src: [
					`${articles}/${bookConfig.bookname}-*/`, // pdf, epub temp dir
					`${articles}/*.pdf`,
					`${articles}/*.epub`,
					`${articles}/*.html`,
					`${articles}/*.xml`,
					`${articles}/*.txt`,
				],
			},
			publish: {
				src: `${publish}/`,
			},
		},
		sass: {
			dist: {
				options: {
					bundleExec: true,
					sourcemap: 'none',
				},
				files: {
					'articles/style.css': 'articles/style.scss',
					'articles/style-web.css': 'articles/style-web.scss',
				},
			},
		},
		shell: {
			preprocess: {
				options: {
					execOptions: {
						cwd: articles,
					},
				},
				command: `${reviewPreproc} -r --tabwidth=2 *.re`,
			},
			compile2latex: {
				options: {
					execOptions: {
						cwd: articles,
					},
				},
				command: `${reviewCompile} --target=latex --footnotetext`,
			},
			compile2idgxml: {
				options: {
					execOptions: {
						cwd: articles,
					},
				},
				command: `${reviewCompile} --target=idgxml`,
			},
			compile2pdf: {
				options: {
					execOptions: {
						cwd: articles,
					},
				},
				command: `${reviewPdfMaker} config.yml`,
			},
			compile2epub: {
				options: {
					execOptions: {
						cwd: articles,
					},
				},
				command: `${reviewEpubMaker} config.yml`,
			},
		},
	});

	function generateTask(target, pretask) {
		pretask = pretask || [];
		return ["clean"].concat(pretask).concat(["shell:preprocess", `shell:compile2${target}`]);
	}

	grunt.registerTask(
		"default",
		"原稿をコンパイルしてPDFファイルにする",
		"pdf");

	grunt.registerTask(
		"idgxml",
		"原稿をコンパイルしてInDesign用XMLファイルにする",
		generateTask("idgxml"));

	grunt.registerTask(
		"pdf",
		"原稿をコンパイルしてpdfファイルにする",
		generateTask("pdf"));

	grunt.registerTask(
		"epub",
		"原稿をコンパイルしてepubファイルにする",
		generateTask("epub", ["sass"]));

	require("load-grunt-tasks")(grunt);
};
