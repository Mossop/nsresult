#! /usr/bin/env python
import os
import sys
import json
import re
from urllib import urlopen, urlretrieve
from imp import load_source

ERROR_LIST_MODULE = 'https://hg.mozilla.org/mozilla-central/raw-file/tip/xpcom/base/ErrorList.py'
RESULT_MESSAGES = 'https://hg.mozilla.org/mozilla-central/raw-file/tip/js/xpconnect/src/xpc.msg'

MESSAGE_RE = re.compile(r'''\s*XPC_MSG_DEF\(\s*(\S+)\s*,\s*"(.*)"\)\s*$''')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Need to specify a path to save to.')
        exit(1)

    errors = {}

    (filename, _) = urlretrieve(ERROR_LIST_MODULE)
    try:
        module = load_source('ErrorList', filename)
        errors = {}

        for (name, value) in module.errors.iteritems():
            errors[name] = {
                'value': value,
                'message': None,
            }
    finally:
        os.remove(filename)

    fp = urlopen(RESULT_MESSAGES)
    for line in fp:
        match = MESSAGE_RE.match(line)
        if match is not None:
            if match.group(1) in errors:
                errors[match.group(1)]['message'] = match.group(2)

    with open(sys.argv[1], 'w') as fp:
        json.dump(errors, fp, indent=2)
