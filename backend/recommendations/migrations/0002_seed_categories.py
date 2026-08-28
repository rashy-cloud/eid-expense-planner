from django.db import migrations


def seed_categories(apps, schema_editor):
    Category = apps.get_model("budgets", "Category")

    categories = [
        {
            "name": "Food",
            "description": "Food and meal expenses for Eid.",
            "is_adha_only": False,
        },
        {
            "name": "Clothing",
            "description": "Eid clothing, shoes and accessories.",
            "is_adha_only": False,
        },
        {
            "name": "Gifts",
            "description": "Gifts for family and friends.",
            "is_adha_only": False,
        },
        {
            "name": "Transport",
            "description": "Travel and transportation costs.",
            "is_adha_only": False,
        },
        {
            "name": "Decorations",
            "description": "Eid decorations and home preparation.",
            "is_adha_only": False,
        },
        {
            "name": "Charity",
            "description": "Charity and giving during Eid.",
            "is_adha_only": False,
        },
        {
            "name": "Entertainment",
            "description": "Eid outings and entertainment.",
            "is_adha_only": False,
        },
        {
            "name": "Qurbani",
            "description": "Qurbani or Udhiya expenses for Eid al-Adha.",
            "is_adha_only": True,
        },
        {
            "name": "Other",
            "description": "Other Eid-related expenses.",
            "is_adha_only": False,
        },
    ]

    for category in categories:
        Category.objects.get_or_create(
            name=category["name"],
            defaults={
                "description": category["description"],
                "is_adha_only": category["is_adha_only"],
            },
        )


def remove_categories(apps, schema_editor):
    Category = apps.get_model("budgets", "Category")

    Category.objects.filter(
        name__in=[
            "Food",
            "Clothing",
            "Gifts",
            "Transport",
            "Decorations",
            "Charity",
            "Entertainment",
            "Qurbani",
            "Other",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("budgets", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_categories),
    ]