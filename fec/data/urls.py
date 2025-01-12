from django.conf.urls import url

from data import views
from data import views_datatables
from fec import settings

urlpatterns = [
    url(r'^data/$', views.landing, name='data-landing'),
    url(r'^data/search/$', views.search),
    url(r'^data/browse-data/$', views.browse_data, name='browse-data'),
    url(r'^data/candidate/(?P<candidate_id>\w+)/$', views.candidate),
    url(r'^data/committee/(?P<committee_id>\w+)/$', views.committee, name='committee-by-id'),
    url(r'^data/elections/(?P<office>\w+)/(?P<state>\w+)/(?P<district>\w+)/(?P<cycle>[0-9]+)/$',
        views.elections, name='elections-house'),
    url(r'^data/elections/(?P<office>\w+)/(?P<state>\w+)/(?P<cycle>[0-9]+)/$', views.elections,
        name='elections-senate'),
    url(r'^data/elections/president/(?P<cycle>[0-9]+)/$', views.elections_president, name='elections-president'),
    url(r'^data/elections/$', views.elections_lookup),
    url(r'^data/raising-bythenumbers/$', views.raising),
    url(r'^data/spending-bythenumbers/$', views.spending),

    # Feedback Tool
    url(r'^data/issue/reaction/$', views.reactionFeedback),
    url(r'^data/issue/$', views.feedback),

    # Datatables
    url(r'^data/candidates/(?P<office>\w+)/$',
        views_datatables.candidates_office),
    url(r'^data/candidates/$', views_datatables.candidates),
    url(r'^data/committees/$', views_datatables.committees),
    url(r'^data/communication-costs/$',
        views_datatables.communication_costs),
    url(r'^data/disbursements/$', views_datatables.disbursements),
    url(r'^data/electioneering-communications/$',
        views_datatables.electioneering_communications),
    url(r'^data/filings/$', views_datatables.filings),
    url(r'^data/independent-expenditures/$',
        views_datatables.independent_expenditures),
    url(r'^data/individual-contributions/$',
        views_datatables.individual_contributions),
    url(r'^data/loans/$', views_datatables.loans),
    url(r'^data/party-coordinated-expenditures/$',
        views_datatables.party_coordinated_expenditures),
    url(r'^data/receipts/individual-contributions/$',
        views_datatables.individual_contributions),
    url(r'^data/receipts/$', views_datatables.receipts),
    url(r'^data/reports/(?P<form_type>[\w-]+)/$', views_datatables.reports),
    url(r'^legal-resources/enforcement/audit-search/$', views_datatables.audit),

    url(r'^widgets/aggregate-totals/$', views.aggregate_totals),
]

if settings.FEATURES.get('pac_party'):
    urlpatterns.append(
        url(r'^data/committees/pac-party/$', views_datatables.pac_party)
    )

if settings.FEATURES.get('debts'):
    # Debts section TODO: debts dates
    urlpatterns.append(
        url(r'^data/debts/$', views_datatables.debts)
    )

if settings.FEATURES.get('presidential_map'):
    # Presidential candidate map
    urlpatterns.append(
        url(r'^data/candidates/president/presidential-map/$', views.pres_finance_map)
    )

if settings.FEATURES.get('house_senate_overview'):
    """
    There is a new pattern above (data/elections/president) and new view(`views.elections_president`) to resolve
    the issue of 'data/elections<office/cycle>' now pointing to `views.house_senate_overview`

    """
    urlpatterns.append(
        url(r'^data/elections/(?P<office>\w+)/(?P<cycle>[0-9]+)/$', views.house_senate_overview,
            name='elections-overview')
    )
    urlpatterns.append(
        url(r'^data/elections/(?P<office>\w+)/$', views.house_senate_overview)
    )
