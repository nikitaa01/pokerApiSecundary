<!-- # Flow lobbies poker
਍⌀⌀ 唀渀椀漀渀ഀഀ
Para iniciar la conexion se debe de mandar un json con el atributo "status" en "CREATE" o "JOIN"
਍⌀⌀⌀ 䔀樀攀洀瀀氀漀 挀漀渀 ∀猀琀愀琀甀猀 挀爀攀愀琀攀∀ഀഀ
Se deberia de mandar un JSON con esta estructura:
਍怀怀怀 䨀匀伀一ഀഀ
{
਍    ∀猀琀愀琀甀猀∀㨀 ∀䌀刀䔀䄀吀䔀∀ഀഀ
}
਍怀怀怀ഀഀ
El "status create" devolvera:
਍怀怀怀 䨀匀伀一ഀഀ
{
਍    ∀猀琀愀琀甀猀∀㨀 ∀䌀刀䔀䄀吀䔀䐀∀Ⰰഀഀ
    "msg": {
਍        ∀最椀搀∀㨀 ∀堀堀堀堀堀∀ ⼀⼀ 猀琀爀椀渀最 愀氀昀愀渀甀洀攀爀椀挀漀 攀渀 洀愀礀甀猀挀甀氀愀猀 搀攀 㔀 搀椀最椀琀漀猀ഀഀ
    }
਍紀ഀഀ
```
਍䔀氀 ∀最椀搀∀ 攀猀 攀氀 挀漀搀椀最漀 焀甀攀 猀攀爀瘀椀爀愀 瀀愀爀愀 甀渀椀爀猀攀 愀氀 氀漀戀戀礀ഀഀ
### Ejemplo con "status join"
਍匀攀 搀攀戀攀爀椀愀 搀攀 洀愀渀搀愀爀 甀渀 䨀匀伀一 挀漀渀 攀猀琀愀 攀猀琀爀甀挀琀甀爀愀㨀ഀഀ
``` JSON
਍笀ഀഀ
    "status": "JOIN",
਍    ∀最椀搀∀㨀 ∀堀堀堀堀堀∀ ⼀⼀ 猀琀爀椀渀最 愀氀昀愀渀甀洀攀爀椀挀漀 攀渀 洀愀礀甀猀挀甀氀愀猀 搀攀 㔀 搀椀最椀琀漀猀ഀഀ
}
਍怀怀怀ഀഀ
El gid es el codigo del lobby al que se va unir el cliente
਍䔀氀 ∀猀琀愀琀甀猀 挀爀攀愀琀攀∀ 搀攀瘀漀氀瘀攀爀愀㨀ഀഀ
``` JSON
਍笀ഀഀ
    "status": "CREATED",
਍    ∀洀猀最∀㨀 笀ഀഀ
        "clients": [ // Array de identificadores de usuarios
਍            ∀攀礀䨀稀搀圀䤀椀伀椀䤀砀䤀椀眀椀戀洀䘀琀娀匀䤀㘀䤀樀唀椀䰀䌀䨀瀀夀堀儀椀伀樀刀㤀∀Ⰰഀഀ
            "eyJzdWIiOiIxNCIsIm5hbWUiOiI1IiwiaWF0Ijo0fQ",
਍            ∀攀礀䨀稀搀圀䤀椀伀椀䤀砀一䌀䤀猀䤀洀㔀栀戀唀嘀氀䤀樀漀椀一匀䤀猀䤀洀氀栀搀䌀䤀㘀一䠀　∀ഀഀ
        ],
਍        ∀挀氀椀攀渀琀∀㨀 ∀攀礀䨀稀搀圀䤀椀伀椀䤀砀一䌀䤀猀䤀洀㔀栀戀唀嘀氀䤀樀漀椀一匀䤀猀䤀洀氀栀搀䌀䤀㘀一䠀　∀ഀഀ
    }
਍紀ഀഀ
```
਍挀氀椀攀渀琀猀 猀漀渀 琀漀搀漀猀 氀漀猀 甀猀甀愀爀椀漀猀 焀甀攀 攀猀琀愀渀 攀渀 氀愀 氀漀戀戀礀ഀഀ
y client es el ultimo usuario que se ha unido
਍⌀⌀ 䌀漀渀攀砀椀漀渀ഀഀ
Pero antes de hacer una de estas dos operaciones iniciales se debe de mandar otro json con el token guardado en locale storage que servira de  -->