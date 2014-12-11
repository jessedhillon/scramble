from pyramid.config import Configurator
from pyramid_beaker import session_factory_from_settings
from sqlalchemy import engine_from_config

import scramble.models as models
import scramble.dictionary as dictionary


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    models.initialize(engine)
    config = Configurator(settings=settings,
                          root_factory='scramble.lib:RootFactory',
                          session_factory=session_factory_from_settings(settings),
                          # authentication_policy=AuthTktAuthenticationPolicy(
                          #     'd8a32801201043bc28d54ecfcc6fcd863f2168f3',
                          #     callback=scramble.security.lookup_userid),
                          # authorization_policy=ACLAuthorizationPolicy()
                          )

    config.include('pyramid_jinja2')
    config.include('pyramid_scss')

    dictionary.load_words(settings['scramble.dictionary'])

    config.add_static_view('static', 'scramble:static', cache_max_age=3600)

    # entity
    config.add_route('home', '/')
    config.add_view(route_name='home', view='scramble.controllers.home.index',
                    renderer='/home/index.jinja2', request_method='GET')

    config.add_route('word', '/word')
    config.add_view(route_name='word', view='scramble.controllers.dictionary.get_word',
                    renderer='json', request_method='GET')

    # scss
    config.add_route('css', '/css/{css_path}.css')
    config.add_view(route_name='css', view='pyramid_scss.controller.get_scss',
                    renderer='scss', request_method='GET')

    config.commit()
    add_template_filters(config)
    return config.make_wsgi_app()


def add_template_filters(config):
    import scramble.lib.filters
    env = config.get_jinja2_environment()

    filters = {}
    for name in dir(scramble.lib.filters):
        if name.endswith('_filter'):
            filter_name = '_'.join(name.split('_')[:-1])
            filters[filter_name] = getattr(scramble.lib.filters, name)

    env.filters.update(filters)
