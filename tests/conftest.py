"""
Pytest configuration for ProSWARM template tests.
"""

import pytest
import sys
from pathlib import Path

# Add template root to path
TEMPLATE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(TEMPLATE_DIR))

# Add hooks directory to path for unit tests
HOOKS_DIR = TEMPLATE_DIR / ".claude" / "hooks"
sys.path.insert(0, str(HOOKS_DIR))


@pytest.fixture(scope="session")
def template_dir():
    """Return the template root directory."""
    return TEMPLATE_DIR


@pytest.fixture(scope="session")
def hooks_dir():
    """Return the hooks directory."""
    return HOOKS_DIR


@pytest.fixture(scope="session")
def agents_dir():
    """Return the agents directory."""
    return TEMPLATE_DIR / ".claude" / "agents"


@pytest.fixture(scope="session")
def skills_dir():
    """Return the skills directory."""
    return TEMPLATE_DIR / ".claude" / "skills"
