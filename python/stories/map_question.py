import asyncio
from drive import database


async def get_stories():
    return list(database["stories"].find())


async def get_questions(story: int, sentence: str) -> list:
    questions = list(database["storyquestions"].find({
        "story": story,
        "sentence": sentence,
    }))
    return [question["_id"] for question in questions]


async def update_story(story: dict):
    result = await asyncio.gather(*[get_questions(story['_id'], sentence['_id']) for sentence in story['sentences']])
    for i in range(len(story['sentences'])):
        story['sentences'][i]['questions'] = result[i]
    database["stories"].update_one(
        {
            "_id": story["_id"],
        },
        {
            "$set": {
                "sentences": story["sentences"]
            }
        }
    )


async def main():
    stories = await get_stories()
    await asyncio.gather(*[update_story(story) for story in stories])


asyncio.run(main())
