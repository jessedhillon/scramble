def setup(env):
    import sys
    import atexit
    import os
    import sys

    sys.ps1 = 'py(scramble)> '
    sys.ps2 = '  (scramble)> '

    try:
        import readline
    except ImportError:
        print "Module readline not available."
    else:
        import rlcompleter
        readline.parse_and_bind("tab: complete")

    history_path = os.path.expanduser("~/.scramble_history")

    def save_history(history_path=history_path):
        import readline
        readline.write_history_file(history_path)

    if os.path.exists(history_path):
        readline.read_history_file(history_path)

    atexit.register(save_history)

    # anything not deleted (sys and os) will remain in the interpreter session
    del atexit, readline, rlcompleter, save_history, history_path
