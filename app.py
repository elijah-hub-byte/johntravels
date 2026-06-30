from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from config import config
from extensions import db
import os


def create_app(env='default'):
    app = Flask(__name__)
    app.config.from_object(config[env])
    db.init_app(app)
    CORS(app)
    os.makedirs(os.path.join(app.root_path, 'database'), exist_ok=True)

    from models import Enquiry, ContactMessage, Testimonial, SiteStats

    # ── MAIN PAGE ──────────────────────────────────────────────────
    @app.route('/')
    def index():
        return render_template('index.html')

    # ── STATS ──────────────────────────────────────────────────────
    @app.route('/api/stats')
    def get_stats():
        s = SiteStats.query.first()
        return jsonify({'trips_completed': s.trips_completed,
                        'happy_customers': s.happy_customers,
                        'cities_covered':  s.cities_covered,
                        'years_experience':s.years_experience})

    @app.route('/api/stats', methods=['PUT'])
    def update_stats():
        s, d = SiteStats.query.first(), request.get_json()
        for k in ('trips_completed','happy_customers','cities_covered','years_experience'):
            if k in d: setattr(s, k, d[k])
        db.session.commit()
        return jsonify({'success': True})

    # ── ENQUIRY ────────────────────────────────────────────────────
    @app.route('/api/enquiry', methods=['POST'])
    def submit_enquiry():
        d = request.get_json()
        if not d.get('name') or not d.get('phone'):
            return jsonify({'success': False, 'message': 'Name and phone required.'}), 400
        db.session.add(Enquiry(
            name=d.get('name','').strip(), phone=d.get('phone','').strip(),
            vehicle=d.get('vehicle',''), trip_type=d.get('trip_type',''),
            from_location=d.get('from_location','').strip(),
            to_location=d.get('to_location','').strip(),
            trip_date=d.get('trip_date',''), message=d.get('message','').strip()))
        s = SiteStats.query.first()
        if s: s.trips_completed += 1
        db.session.commit()
        return jsonify({'success': True, 'message': 'Booking received! We\'ll call you shortly. 📞'})

    @app.route('/api/enquiry/<int:eid>', methods=['PATCH'])
    def patch_enquiry(eid):
        e = Enquiry.query.get_or_404(eid)
        e.status = request.get_json().get('status', e.status)
        db.session.commit()
        return jsonify({'success': True})

    @app.route('/api/enquiry/<int:eid>', methods=['DELETE'])
    def delete_enquiry(eid):
        db.session.delete(Enquiry.query.get_or_404(eid))
        db.session.commit()
        return jsonify({'success': True})

    # ── CONTACT ────────────────────────────────────────────────────
    @app.route('/api/contact', methods=['POST'])
    def submit_contact():
        d = request.get_json()
        if not d.get('name') or not d.get('phone'):
            return jsonify({'success': False, 'message': 'Name and phone required.'}), 400
        db.session.add(ContactMessage(
            name=d.get('name','').strip(), phone=d.get('phone','').strip(),
            message=d.get('message','').strip()))
        db.session.commit()
        return jsonify({'success': True, 'message': 'Message received! We\'ll contact you soon. 😊'})

    # ── TESTIMONIALS ───────────────────────────────────────────────
    @app.route('/api/testimonials')
    def get_testimonials():
        ts = Testimonial.query.order_by(Testimonial.id).all()
        return jsonify([{'id':t.id,'name':t.name,'location':t.location,
                         'rating':t.rating,'review':t.review,'vehicle':t.vehicle} for t in ts])

    # ── ADMIN ──────────────────────────────────────────────────────
    @app.route('/admin')
    def admin():
        return render_template('admin.html',
            enquiries=Enquiry.query.order_by(Enquiry.created_at.desc()).all(),
            contacts=ContactMessage.query.order_by(ContactMessage.created_at.desc()).all(),
            stats=SiteStats.query.first())

    # ── SEED DATA ──────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        if not SiteStats.query.first():
            db.session.add(SiteStats())
            db.session.commit()
        if Testimonial.query.count() == 0:
            seeds = [
                Testimonial(name='Ravi Kumar',   location='Rajahmundry', rating=5, vehicle='Innova',
                    review='Excellent service! John driver was very polite and professional. The Innova was spotless and AC worked perfectly throughout our Hyderabad trip.'),
                Testimonial(name='Lakshmi Devi', location='Ravulapalem', rating=5, vehicle='Dzire',
                    review='Very reliable cab service. Booked for airport drop to Vizag. Driver arrived 10 minutes early. Highly recommended for all trips!'),
                Testimonial(name='Suresh Babu',  location='Amalapuram',  rating=5, vehicle='Ertiga',
                    review='Took the Ertiga for a family pilgrimage tour. Very comfortable for 6 people. Driver knew all the routes well. Will definitely book again!'),
                Testimonial(name='Priya Reddy',  location='Bhimavaram',  rating=5, vehicle='Swift',
                    review='Best cab in the area! Affordable price, clean vehicle, punctual driver. John travels is our go-to for all trips from now on.'),
                Testimonial(name='Venkat Rao',   location='Ravulapalem', rating=5, vehicle='Innova',
                    review='Used their Innova for a wedding function. Everything was perfect — on time, well maintained, and the driver was very courteous. 5 stars!'),
            ]
            db.session.add_all(seeds)
            db.session.commit()

    return app


if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    create_app(env).run(host='0.0.0.0', port=5000, debug=(env == 'development'))
