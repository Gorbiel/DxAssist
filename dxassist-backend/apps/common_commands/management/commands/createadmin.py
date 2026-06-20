from django.core.management.base import BaseCommand

from apps.users.models import User


class Command(BaseCommand):
    help = "Create DxAssist admin user"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--name", required=True)
        parser.add_argument("--password", required=True)

    def handle(self, *args, **options):
        email = options["email"]
        name = options["name"]
        password = options["password"]

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING("User already exists"))
            return

        User.objects.create_superuser(
            email=email,
            name=name,
            password=password,
        )

        self.stdout.write(self.style.SUCCESS(f"Created admin: {email}"))
