'use strict';

var grunt = require('grunt'),
    fs = require('fs');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function getSize(file) {
  return fs.lstatSync(file).size;
}

var PNG_FILE_NAME = 'dp.png',
    JPG_FILE_NAME = 'dp.jpg',
    EXPECTED_PNG_SIZE = getSize('test/expected/single/' + PNG_FILE_NAME),
    EXPECTED_JPG_SIZE = getSize('test/expected/single/' + JPG_FILE_NAME);

function ensureIsAnArray(dirs) {
	grunt.log.writeln(!dirs.length);
	if (dirs && !(dirs instanceof Array)) {
		var newDirs = [];
		newDirs.push(dirs);
		return newDirs;
	}
	return dirs;
}
function testSingleFile(test, dir, msg) {
  test.expect(1);

  var new_size = getSize('test/tmp/' + dir + '/' + PNG_FILE_NAME);

  test.deepEqual(new_size, EXPECTED_PNG_SIZE, msg);
  test.done();
}

function testFileNotExists(test, dirs, png_msg, jpg_msg) {
	dirs = ensureIsAnArray(dirs);
  test.expect((((png_msg !== '') ? 1 : 0) + ((jpg_msg !== '') ? 1 : 0)) * dirs.length);

	dirs.forEach(function (dir) {
		if (png_msg !== '') {
			var png_exists = grunt.file.exists('test/tmp/' + dir + '/' + PNG_FILE_NAME);
			test.equal(false, png_exists, png_msg);
		}
		if (jpg_msg !== '') {
			var jpg_exists = grunt.file.exists('test/tmp/' + dir + '/' + JPG_FILE_NAME);
			test.equal(false, jpg_exists, jpg_msg);
		}
	});
  
  test.done();
}

function testFileNotDownsized(test, dirs, png_msg, jpg_msg) {
  dirs = ensureIsAnArray(dirs);
  test.expect((((png_msg !== '') ? 1 : 0) + ((jpg_msg !== '') ? 1 : 0)) * dirs.length);

	dirs.forEach(function (dir) {
		if (png_msg !== '') {
			var new_png_size = getSize('test/tmp/' + dir + '/' + PNG_FILE_NAME);
			test.notDeepEqual(new_png_size, EXPECTED_PNG_SIZE, png_msg);
		}
		if (jpg_msg !== '') {
			var new_jpg_size = getSize('test/tmp/' + dir + '/' + JPG_FILE_NAME);
			test.notDeepEqual(new_jpg_size, EXPECTED_JPG_SIZE, jpg_msg);
		}
	});
	
  test.done();
}

function testMultipleFiles(test, dir, png_msg, jpg_msg) {
  test.expect(2);

  var new_png_size = getSize('test/tmp/' + dir + '/' + PNG_FILE_NAME),
      new_jpg_size = getSize('test/tmp/' + dir + '/' + JPG_FILE_NAME);

  test.deepEqual(new_png_size, EXPECTED_PNG_SIZE, png_msg);
  test.deepEqual(new_jpg_size, EXPECTED_JPG_SIZE, jpg_msg);
  test.done();
}

function testNestedDir(test, dirs, png_msg, jpg_msg) {
	dirs = ensureIsAnArray(dirs);
  test.expect((((png_msg !== '') ? 1 : 0) + ((jpg_msg !== '') ? 1 : 0)) * dirs.length);
	
	dirs.forEach(function (dir) {
		if (png_msg !== '') {
			var new_png_size = getSize('test/tmp/' + dir + '/' + PNG_FILE_NAME);
			test.deepEqual(new_png_size, EXPECTED_PNG_SIZE, png_msg);
		}
		if (jpg_msg !== '') {
			var new_jpg_size = getSize('test/tmp/' + dir + '/' + JPG_FILE_NAME);
			test.deepEqual(new_jpg_size, EXPECTED_JPG_SIZE, jpg_msg);
		}
	});
  test.done();
}

exports.smushit = {
  setUp: function (done) {
    done();
  },
  replace_single_dir: function (test) {
    testMultipleFiles(test, 'replace_single_dir', 'should run with a single directory and replace a png file', 'should run with a single directory and replace a jpg file');
  },
  replace_single_file: function (test) {
    testSingleFile(test, 'replace_single_file', 'should replace a single png file');
  },
	replace_single_file_not_downsize_jpg: function (test) {
		testFileNotDownsized(test, 'replace_single_file', '', 'jpg file should not send to smushit and size should stay the same');
	},
  replace_single_filter: function (test) {
    testSingleFile(test, 'replace_single_filter', 'should run with png extension filter and replace a png file');
  },
	replace_single_filter_not_downsize_jpg: function (test) {
		testFileNotDownsized(test, 'replace_single_filter', '', 'jpg file should not send to smushit and size should stay the same');
	},
  replace_multiple_files: function (test) {
    testMultipleFiles(test, 'replace_multiple_files', 'should run with multiple files and replace png files', 'should run with a multiple files and replace jpg files');
  },
  replace_multiple_filters: function (test) {
    testMultipleFiles(test, 'replace_multiple_filters', 'should filter and replace png files', 'should filter and replace jpg files');
  },
  output_single_dir: function (test) {
    testMultipleFiles(test, 'output_single_dir', 'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
  output_single_dir_with_sub: function (test) {
    testMultipleFiles(test, 'output_single_dir_with_sub/single', 'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
  output_single_file: function (test) {
    testSingleFile(test, 'output_single_file', 'should move the optimized png file');
  },
	output_single_file_not_exist_jpg: function (test) {
		testFileNotExists(test, 'output_single_file', '', 'jpg file should not be copied to dest folder');
	},
  output_single_filter: function (test) {
    testSingleFile(test, 'output_single_filter', 'should run with png extension filter and move the optimized png file');
  },
	output_single_filter_not_exist_jpg: function (test) {
		testFileNotExists(test, 'output_single_filter', '', 'jpg file should not be copied to dest folder');
	},
  output_multiple_filters: function (test) {
    testMultipleFiles(test, 'output_multiple_filters', 'should filter and move the optimized png files', 'should filter and move the optimized jpg files');
  },
  output_multiple_files: function (test) {
    testMultipleFiles(test, 'output_multiple_files', 'should run with multiple files and move the optimized png files', 'should run with a multiple files and move the optimized jpg files');
  },
	output_single_dir_with_cwd: function (test) {
    testMultipleFiles(test, 'output_single_dir_with_cwd', 'should run with a single directory and move the optimized png file provided with cwd', 'should run with a single directory and move the optimized jpg file provided with cwd');
  },
  output_single_dir_with_sub_with_cwd: function (test) {
    testMultipleFiles(test, 'output_single_dir_with_sub_with_cwd', 'should run with a single directory and move the optimized png file provided with cwd', 'should run with a single directory and move the optimized jpg file provided with cwd');
  },
  output_single_file_with_cwd: function (test) {
    testSingleFile(test, 'output_single_file_with_cwd', 'should move the optimized png file provided with cwd');
  },
	output_single_file_with_cwd_not_exist_jpg: function (test) {
		testFileNotExists(test, 'output_single_file_with_cwd', '', 'jpg file should not be copied to dest folder');
	},
  output_single_filter_with_cwd: function (test) {
    testSingleFile(test, 'output_single_filter_with_cwd', 'should run with png extension filter and move the optimized png file provided with cwd');
  },
	output_single_filter_with_cwd_not_exist_jpg: function (test) {
		testFileNotExists(test, 'output_single_filter_with_cwd', '', 'jpg file should not be copied to dest folder');
	},
  output_multiple_filters_with_cwd: function (test) {
    testMultipleFiles(test, 'output_multiple_filters_with_cwd', 'should filter and move the optimized png files provided with cwd', 'should filter and move the optimized jpg files provided with cwd');
  },
  output_multiple_files_with_cwd: function (test) {
    testMultipleFiles(test, 'output_multiple_files_with_cwd', 'should run with multiple files and move the optimized png files provided with cwd', 'should run with a multiple files and move the optimized jpg files provided with cwd');
  },
	output_single_nested_dir: function (test) {
    testNestedDir(test, ['output_single_nested_dir', 'output_single_nested_dir/a', 'output_single_nested_dir/a/b'],
									'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
	output_single_nested_dir_ending_with_slash: function (test) {
    testNestedDir(test, ['output_single_nested_dir_ending_with_slash', 'output_single_nested_dir_ending_with_slash/a', 'output_single_nested_dir_ending_with_slash/a/b'],
									'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
	output_single_nested_dir_with_filter: function (test) {
    testNestedDir(test, ['output_single_nested_dir_with_filter', 'output_single_nested_dir_with_filter/a', 'output_single_nested_dir_with_filter/a/b'],
									'should run with a single directory and move the optimized png file', '');
  },
	output_single_nested_dir_with_filter_not_exist_jpg: function (test) {
		testFileNotExists(test, ['output_single_nested_dir_with_filter', 'output_single_nested_dir_with_filter/a', 'output_single_nested_dir_with_filter/a/b'],
											'', 'jpg file should not be copied to dest folder');
	},
	output_multiple_nested_dir1: function (test) {
    testNestedDir(test, ['output_multiple_nested_dir', 'output_multiple_nested_dir/a', 'output_multiple_nested_dir/a/b'],
									'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
	output_multiple_nested_dir2: function (test) {
		testNestedDir(test, ['output_multiple_nested_dir', 'output_multiple_nested_dir/a1', 'output_multiple_nested_dir/a1/b2'],
									'should run with a single directory and move the optimized png file', 'should run with a single directory and move the optimized jpg file');
  },
	output_multiple_nested_dir_with_filter1: function (test) {
    testNestedDir(test, ['output_multiple_nested_dir_with_filter', 'output_multiple_nested_dir_with_filter/a', 'output_multiple_nested_dir_with_filter/a/b'],
									'should run with a single directory and move the optimized png file', '');
  },
	output_multiple_nested_dir_with_filter_not_exist_jpg: function (test) {
		testFileNotExists(test, ['output_multiple_nested_dir_with_filter/a', 'output_multiple_nested_dir_with_filter/a/b'],
											'', 'jpg file should not be copied to dest folder');
	},
	output_multiple_nested_dir_with_filter2: function (test) {
		testNestedDir(test, ['output_multiple_nested_dir_with_filter', 'output_multiple_nested_dir_with_filter/a1', 'output_multiple_nested_dir_with_filter/a1/b2'],
									'', 'should run with a single directory and move the optimized jpg file');
  },
	output_multiple_nested_dir_with_filter2_not_exist_png: function (test) {
		testFileNotExists(test, ['output_multiple_nested_dir_with_filter/a1', 'output_multiple_nested_dir_with_filter/a1/b2'],
											'png file should not be copied to dest folder', '');
	},
	output_single_nested_dir_with_cwd: function (test) {
    testNestedDir(test, ['output_single_nested_dir_with_cwd', 'output_single_nested_dir_with_cwd/a', 'output_single_nested_dir_with_cwd/a/b'],
									'should run with a single nested directory and move the optimized png file provided with cwd', 'should run with a single nested directory and move the optimized jpg file provided with cwd');
  },
	output_single_nested_dir_ending_with_slash_with_cwd: function (test) {
    testNestedDir(test, ['output_single_nested_dir_ending_with_slash_with_cwd', 'output_single_nested_dir_ending_with_slash_with_cwd/a', 'output_single_nested_dir_ending_with_slash_with_cwd/a/b'],
									'should run with a single nested directory and move the optimized png file provided with cwd', 'should run with a single nested directory and move the optimized jpg file provided with cwd');
  },
	output_single_nested_dir_with_filter_with_cwd: function (test) {
    testNestedDir(test, ['output_single_nested_dir_with_filter_with_cwd', 'output_single_nested_dir_with_filter_with_cwd/a', 'output_single_nested_dir_with_filter_with_cwd/a/b'],
									'should run with a single nested directory and move the optimized png file provided with cwd', '');
  },
	output_single_nested_dir_with_filter_with_cwd_not_exist_jpg: function (test) {
		testFileNotExists(test, ['output_single_nested_dir_with_filter_with_cwd', 'output_single_nested_dir_with_filter_with_cwd/a', 'output_single_nested_dir_with_filter_with_cwd/a/b'],
											'', 'jpg file should not be copied to dest folder');
	},
	output_multiple_nested_dir_with_cwd1: function (test) {
    testNestedDir(test, ['output_multiple_nested_dir_with_cwd', 'output_multiple_nested_dir_with_cwd/a', 'output_multiple_nested_dir_with_cwd/a/b'],
									'should run with multiple nested directory and move the optimized png file provided with cwd', 'should run with multiple nested directories and move the optimized jpg file provided with cwd');
  },
	output_multiple_nested_dir_with_cwd2: function (test) {
		testNestedDir(test, ['output_multiple_nested_dir_with_cwd', 'output_multiple_nested_dir_with_cwd/a1', 'output_multiple_nested_dir_with_cwd/a1/b2'],
									'should run with multiple nested directory and move the optimized png file provided with cwd', 'should run with multiple nested directories and move the optimized jpg file provided with cwd');
  },
	output_multiple_nested_dir_with_filter_with_cwd1: function (test) {
    testNestedDir(test, ['output_multiple_nested_dir_with_filter_with_cwd', 'output_multiple_nested_dir_with_filter_with_cwd/a', 'output_multiple_nested_dir_with_filter_with_cwd/a/b'],
									'should run with multiple nested directory and move the optimized png file provided with cwd', '');
  },
	output_multiple_nested_dir_with_filter_with_cwd1_not_exist_jpg: function (test) {
		testFileNotExists(test, ['output_multiple_nested_dir_with_filter_with_cwd/a', 'output_multiple_nested_dir_with_filter_with_cwd/a/b'],
											'', 'jpg file should not be copied to dest folder');
	},
	output_multiple_nested_dir_with_filter_with_cwd2: function (test) {
		testNestedDir(test, ['output_multiple_nested_dir_with_filter_with_cwd', 'output_multiple_nested_dir_with_filter_with_cwd/a1', 'output_multiple_nested_dir_with_filter_with_cwd/a1/b2'],
									'', 'should run with multiple nested directory and move the optimized jpg file provided with cwd');
  },
	output_multiple_nested_dir_with_filter_with_cwd2_not_exist_png: function (test) {
		testFileNotExists(test, ['output_multiple_nested_dir_with_filter_with_cwd/a1', 'output_multiple_nested_dir_with_filter_with_cwd/a1/b2'],
											'png file should not be copied to dest folder', '');
	},
};
