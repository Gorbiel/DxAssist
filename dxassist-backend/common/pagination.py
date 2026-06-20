from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for list views with configurable page size."""

    page_size = 20
    page_size_query_param = "page_size"
    page_size_query_description = "Number of results per page"
    max_page_size = 100


class SearchResultsSetPagination(PageNumberPagination):
    """Pagination for search results."""

    page_size = 20
    page_size_query_param = "page_size"
    page_size_query_description = "Number of results per page"
    max_page_size = 100
