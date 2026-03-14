from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

def convert_dropbox_url(original_url):
    # Analyser l'URL originale
    parsed = urlparse(original_url)
    
    # Modifier le domaine pour le téléchargement direct
    new_netloc = "dl.dropboxusercontent.com"
    
    # Nettoyer le chemin (supprimer 'scl/fi')
    path_parts = parsed.path.split('/')
    new_path = '/'.join(['', 's'] + path_parts[3:])
    
    # Nettoyer les paramètres de requête (supprimer 'dl=0')
    query_params = parse_qs(parsed.query)
    if 'dl' in query_params:
        del query_params['dl']
    
    # Reconstruire l'URL
    new_query = urlencode(query_params, doseq=True)
    new_url = urlunparse((
        parsed.scheme,
        new_netloc,
        new_path,
        parsed.params,
        new_query,
        parsed.fragment
    ))
    
    return new_url

# Exemple d'utilisation
original_url = input("donner URL : \n")
direct_url = convert_dropbox_url(original_url)

print("URL originale:", original_url)
print("URL directe:  ", direct_url)