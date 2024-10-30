#!/usr/bin/env python3

"""
Module that contains the BasicCache Class
"""


from base_caching import BaseCaching


class BasicCache(BaseCaching):
    """
    A class that inherits from `BaseCaching` and is a caching system
    """

    def put(self, key, item):
        """
        Assign to the dictionary  the
        item value for the key
        """
        if key is not None and item is not None:
            self.cache_data[key] = item

    def get(self, key):
        """
        Return the value in `self.cache_data` linked to `key`
        """

        return self.cache_data.get(key, None)
