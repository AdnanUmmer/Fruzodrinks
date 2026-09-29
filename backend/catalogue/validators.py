from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError

def validate_image(file):
    if file.size > 8 * 1024 * 1024:
        raise ValidationError('Images must be no larger than 8 MB.')
    try:
        file.seek(0)
        with Image.open(file) as image:
            if image.format not in {'PNG', 'JPEG', 'WEBP'}:
                raise ValidationError('Use PNG, JPEG or WebP images.')
            if image.width * image.height > 25_000_000 or max(image.size) > 6000:
                raise ValidationError('Image dimensions exceed the 6000px / 25 megapixel limit.')
            if getattr(image, 'is_animated', False):
                raise ValidationError('Upload a still image.')
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ValidationError('The image is invalid or cannot be decoded.') from exc
    finally:
        file.seek(0)
