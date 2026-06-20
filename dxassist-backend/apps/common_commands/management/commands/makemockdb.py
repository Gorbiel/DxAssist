from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "DxAssist command stub for seeding local development data."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING("No DxAssist mock data seeders are configured yet.")
        )
