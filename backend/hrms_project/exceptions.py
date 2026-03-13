"""
HRMS Lite – Custom Exception Handler
Returns consistent JSON error responses across the entire API.

Response shape on error:
{
    "success": false,
    "message": "Human-readable summary",
    "errors": { ... }   # field-level detail when available
}
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Wrap DRF's default exception handler to produce a uniform error envelope.
    """
    # Let DRF handle the exception first
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'message': _build_message(response.data),
            'errors': response.data,
        }
        response.data = error_data
    else:
        # Unhandled server errors
        response = Response(
            {
                'success': False,
                'message': 'An unexpected server error occurred. Please try again later.',
                'errors': {},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _build_message(data):
    """Convert DRF error data into a single human-readable message."""
    if isinstance(data, dict):
        # e.g. {'email': ['Enter a valid email address.']}
        first_key = next(iter(data))
        first_value = data[first_key]
        if isinstance(first_value, list) and first_value:
            return f"{first_key}: {first_value[0]}"
        return str(first_value)
    if isinstance(data, list) and data:
        return str(data[0])
    return 'An error occurred.'
