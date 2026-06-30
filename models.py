from datetime import datetime
from extensions import db


class Enquiry(db.Model):
    __tablename__ = 'enquiries'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    phone         = db.Column(db.String(20),  nullable=False)
    vehicle       = db.Column(db.String(50))
    trip_type     = db.Column(db.String(50))
    from_location = db.Column(db.String(100))
    to_location   = db.Column(db.String(100))
    trip_date     = db.Column(db.String(20))
    message       = db.Column(db.Text)
    status        = db.Column(db.String(20), default='new')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {c.name: (getattr(self, c.name).strftime('%d-%m-%Y %H:%M')
                         if isinstance(getattr(self, c.name), datetime)
                         else getattr(self, c.name))
                for c in self.__table__.columns}


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    phone      = db.Column(db.String(20),  nullable=False)
    message    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {c.name: (getattr(self, c.name).strftime('%d-%m-%Y %H:%M')
                         if isinstance(getattr(self, c.name), datetime)
                         else getattr(self, c.name))
                for c in self.__table__.columns}


class Testimonial(db.Model):
    __tablename__ = 'testimonials'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    location   = db.Column(db.String(100))
    rating     = db.Column(db.Integer, default=5)
    review     = db.Column(db.Text, nullable=False)
    vehicle    = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SiteStats(db.Model):
    __tablename__    = 'site_stats'
    id               = db.Column(db.Integer, primary_key=True)
    trips_completed  = db.Column(db.Integer, default=1500)
    happy_customers  = db.Column(db.Integer, default=800)
    cities_covered   = db.Column(db.Integer, default=15)
    years_experience = db.Column(db.Integer, default=8)
