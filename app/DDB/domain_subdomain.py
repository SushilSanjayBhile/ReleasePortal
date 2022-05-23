import json
from django.http import HttpResponse
from .models import TC_INFO, TC_INFO_GUI

def get_domain_subdomain_list(request, release, interface):
    domain_subdomain_dict = {}

    if interface == "CLI":
        clidata = TC_INFO.objects.using(release).all()
        domaindata = clidata.values('Domain').distinct()
        for domain in domaindata:
            domain = domain["Domain"]
            if domain not in domain_subdomain_dict:
                domain_subdomain_dict[domain] = []

            subdomains = clidata.filter(Domain = domain).values("SubDomain").distinct()
            for subd in subdomains:
                domain_subdomain_dict[domain].append(subd["SubDomain"])

    if interface == "GUI":
        guidata = TC_INFO_GUI.objects.using(release).all()
        domaindata = guidata.values("Domain").distinct()
        for domain in domaindata:
            domain = domain["Domain"]
            if domain not in domain_subdomain_dict:
                domain_subdomain_dict[domain] = []

            subdomains = guidata.filter(Domain = domain).values("SubDomain").distinct()
            for subd in subdomains:
                domain_subdomain_dict[domain].append(subd["SubDomain"])

    return HttpResponse(json.dumps(domain_subdomain_dict))
