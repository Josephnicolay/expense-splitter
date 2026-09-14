For backend, use uv for dependency management. 

A few useful commands:

- `uv sync` - install dependencies
- `uv add <PACKAGE-NAME>`add a package to `pyproject.toml`
- `uv run pytest` - the whole suite
- `uv run pytest tests/test_*.py` - one test file
- `uv run python <PYTHON-FILE>` run a python file

regularly commit code to git 
