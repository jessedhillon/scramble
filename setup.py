import os

from setuptools import setup, find_packages

here =      os.path.abspath(os.path.dirname(__file__))
readme =    open(os.path.join(here, 'README.md')).read()
changes =   open(os.path.join(here, 'CHANGES.md')).read()

requires = [
    'pyramid',
    'psycopg2',
    'SQLAlchemy',
    'transaction',
    'pyramid_tm',
    'pyramid_debugtoolbar',
    'pyramid_beaker',
    'pyramid_scss',
    'pyramid_jinja2',
    'zope.sqlalchemy',
    'waitress',
    'python-dateutil',
    'sqlalchemy-batteries>=0.4.4',
    'docopt',
]

setup(
    name='scramble',
    version='0.0',
    description='scramble',
    long_description="{readme}\n\n{changes}".format(readme=readme, changes=changes),
    classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
    ],
    author='',
    author_email='',
    url='',
    keywords='web wsgi bfg pylons pyramid',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    test_suite='scramble',
    install_requires = requires,
    entry_points = {
        'paste.app_factory': [
            'main = scramble:main',
        ],
        'console_scripts': [
            'populate_scramble = scramble.scripts.populate:main',
        ]
    },
)
